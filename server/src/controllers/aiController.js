const { PrismaClient } = require('@prisma/client');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

const prisma = new PrismaClient();

/* ============================
   AI INITIALIZATION
============================ */

const apiKey = process.env.GOOGLE_AI_API_KEY;

/* ============================
   RATE LIMITING
============================ */

const aiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many AI requests. Please try again later.',
});

// More restrictive rate limit for public/guest users
const publicAiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // Only 20 requests per 15 minutes for guests
  message: 'Too many requests. Please sign up for unlimited access.',
});

/* ============================
   REQUEST VALIDATION
============================ */

const validateChatRequest = [
  body('message').isString().trim().notEmpty(),
  body('history').isArray().optional(),
  body('language').isIn(['EN', 'AM', 'OR']).optional(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

/* ============================
   CHAT ENDPOINT
============================ */

const chat = [
  aiRateLimiter,
  ...validateChatRequest,
  async (req, res) => {
    if (!apiKey) {
      return res.status(503).json({
        error: 'AI Service Unavailable',
        message: 'GOOGLE_AI_API_KEY is missing',
      });
    }

    try {
      const { message, history = [], language = 'EN' } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          companyName: true,
          plan: true,
          role: true,
        }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const businessContext = await getBusinessContext(userId);

      const response = await generateAIResponse({
        message,
        history,
        language,
        user,
        businessContext,
      });

      await logAIInteraction(userId, message, response);

      res.json({
        response,
        context: {
          company: user.companyName,
          plan: user.plan,
          timestamp: new Date().toISOString(),
        }
      });

    } catch (error) {
      console.error('AI Controller Error:', error);
      res.status(500).json({
        error: error.name || 'ServerError',
        message: error.message,
        details: error.details,
      });
    }
  }
];

/* ============================
   BUSINESS CONTEXT
============================ */

async function getBusinessContext(userId) {
  try {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get user's company name for inventory filtering
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { companyName: true }
    });

    const [
      dailySales,
      monthlySales,
      monthlyExpenses,
      lowStockItems,
      recentTasks,
    ] = await Promise.all([
      prisma.transaction.aggregate({
        where: { createdBy: userId, type: 'income', date: { gte: startOfDay } },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { createdBy: userId, type: 'income', date: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { createdBy: userId, type: 'expense', date: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
      prisma.inventoryItem.findMany({
        where: { companyName: user.companyName, quantity: { lte: 10 } },
        select: { name: true, quantity: true },
      }),
      prisma.task.findMany({
        where: { 
          OR: [
            { userId: userId },
            { createdById: userId }
          ]
        },
        orderBy: { dueDate: 'asc' },
        take: 5,
        select: { title: true },
      }),
    ]);

    return {
      dailySales: dailySales._sum.amount || 0,
      monthlySales: monthlySales._sum.amount || 0,
      monthlyExpenses: monthlyExpenses._sum.amount || 0,
      lowStockItems,
      recentTasks,
    };

  } catch (error) {
    console.error('Business context error:', error);
    return {
      dailySales: 0,
      monthlySales: 0,
      monthlyExpenses: 0,
      lowStockItems: [],
      recentTasks: [],
    };
  }
}

/* ============================
   AI GENERATION
============================ */

async function generateAIResponse({ message, history, language, user, businessContext }) {
  try {
    const systemPrompt = buildSystemPrompt({ user, businessContext, language });
    
    // Build full prompt with history
    let fullPrompt = systemPrompt + "\n\n";
    
    if (history && history.length > 0) {
      fullPrompt += "Previous conversation:\n";
      history.forEach(h => {
        fullPrompt += `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}\n`;
      });
      fullPrompt += "\n";
    }
    
    fullPrompt += `User: ${message}\nAssistant:`;

    // Direct REST API call to Google AI v1 endpoint using Gemini 2.5 Flash
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2000
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google AI API Error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0]) {
      throw new Error('No response from AI model');
    }
    
    return data.candidates[0].content.parts[0].text;

  } catch (error) {
    console.error("AI Generation Error:", error);
    throw {
      name: "AIGenerationError",
      message: "Failed to generate AI response",
      details: error.message,
    };
  }
}

/* ============================
   PROMPT BUILDER
============================ */

function buildSystemPrompt({ user, businessContext, language }) {
  const { dailySales, monthlySales, monthlyExpenses, lowStockItems, recentTasks } = businessContext;
  const profit = monthlySales - monthlyExpenses;

  return `
You are Mukti, an ERP AI assistant.

Company: ${user.companyName}
Preferred Language: ${language}

Business Overview:
- Today Sales: ${dailySales} ETB
- Monthly Sales: ${monthlySales} ETB
- Monthly Expenses: ${monthlyExpenses} ETB
- Profit: ${profit} ETB

Low Stock Items:
${lowStockItems.map(i => `- ${i.name} (${i.quantity})`).join('\n')}

Recent Tasks:
${recentTasks.map(t => `- ${t.title}`).join('\n')}

Give clear, short, business-focused answers.
`;
}

/* ============================
   CHAT HISTORY FORMAT
============================ */

function prepareChatHistory(history = []) {
  return history.map(h => ({
    role: h.role === "user" ? "user" : "model",
    parts: [{ text: h.content }],
  }));
}

/* ============================
   LOGGING
============================ */

async function logAIInteraction(userId, input, output) {
  try {
    await prisma.aIInteraction.create({
      data: {
        userId,
        input,
        output,
        metadata: {
          model: "gemini-2.5-flash",
          timestamp: new Date(),
        },
      }
    });
  } catch (error) {
    console.error("AI log error:", error);
  }
}

/* ============================
   PUBLIC CHAT ENDPOINT (NO AUTH)
============================ */

const publicChat = [
  publicAiRateLimiter,
  ...validateChatRequest,
  async (req, res) => {
    if (!apiKey) {
      return res.status(503).json({
        error: 'AI Service Unavailable',
        message: 'GOOGLE_AI_API_KEY is missing',
      });
    }

    try {
      const { message, history = [], language = 'EN' } = req.body;

      // Generate response without business context for public users
      const response = await generatePublicAIResponse({
        message,
        history,
        language,
      });

      res.json({
        response,
        context: {
          mode: 'public',
          timestamp: new Date().toISOString(),
        }
      });

    } catch (error) {
      console.error('Public AI Controller Error:', error);
      res.status(500).json({
        error: error.name || 'ServerError',
        message: error.message,
      });
    }
  }
];

/* ============================
   PUBLIC AI GENERATION
============================ */

async function generatePublicAIResponse({ message, history, language }) {
  try {
    const systemPrompt = buildPublicSystemPrompt({ language });
    
    // Build full prompt with history
    let fullPrompt = systemPrompt + "\n\n";
    
    if (history && history.length > 0) {
      fullPrompt += "Previous conversation:\n";
      history.forEach(h => {
        fullPrompt += `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}\n`;
      });
      fullPrompt += "\n";
    }
    
    fullPrompt += `User: ${message}\nAssistant:`;

    // Direct REST API call to Google AI
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1500
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google AI API Error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0]) {
      throw new Error('No response from AI model');
    }
    
    return data.candidates[0].content.parts[0].text;

  } catch (error) {
    console.error("Public AI Generation Error:", error);
    throw {
      name: "AIGenerationError",
      message: "Failed to generate AI response",
      details: error.message,
    };
  }
}

/* ============================
   PUBLIC PROMPT BUILDER
============================ */

function buildPublicSystemPrompt({ language }) {
  return `
You are Mukti, an AI assistant for Ethiopian businesses.

Preferred Language: ${language}

You help visitors learn about:
- ERP (Enterprise Resource Planning) systems
- Business management in Ethiopia
- Inventory, finance, HR, and sales management
- How MuktiAp can help their business

Give clear, friendly, and helpful answers. If users ask about specific features, encourage them to sign up for a free trial.

Keep responses concise and professional.
`;
}

/* ============================
   EXPORTS
============================ */

module.exports = {
  chat,
  publicChat,
  aiRateLimiter,
  publicAiRateLimiter,
};
