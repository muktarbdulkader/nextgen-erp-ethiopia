const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const rateLimit = require('express-rate-limit');
const { PrismaClient } = require('@prisma/client');
const apiRoutes = require('./src/routes/api');
const logger = require('./src/middleware/logger');
const { errorHandler, notFound } = require('./src/middleware/errorHandler');

// Load .env (correct location)
dotenv.config();

// Initialize Prisma
const prisma = new PrismaClient();

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5001;

// Trust proxy (for deployment behind reverse proxy)
app.set('trust proxy', 1);

// Allowed origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://10.232.83.59:3000',
  'http://172.29.176.1:3000',
  'http://172.21.48.1:3000',
  process.env.FRONTEND_URL,
  // Vercel domains
  'https://nextgen-erp-ethiopia.vercel.app',
  // Render domains
  'https://nextgen-erp-ethiopia.onrender.com',
].filter(Boolean);

// Also allow any .vercel.app subdomain for preview deployments
const isVercelDomain = (origin) => origin && origin.endsWith('.vercel.app');

// CORS middleware
const corsOptions = {
  origin(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    // Allow if in allowedOrigins list or is a Vercel domain
    if (allowedOrigins.includes(origin) || isVercelDomain(origin)) {
      return callback(null, true);
    }

    console.log("❌ Blocked by CORS:", origin);
    return callback(new Error("Not allowed by CORS"));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all requests
app.use(limiter);

// Auth-specific rate limiting (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth requests per windowMs
  skipSuccessfulRequests: true,
  message: 'Too many authentication attempts, please try again later.',
});

// Request logging
if (process.env.NODE_ENV !== 'test') {
  app.use(logger);
}

// Prisma available in req
app.use((req, res, next) => {
  req.prisma = prisma;
  next();
});

// Test database
(async () => {
  try {
    await prisma.$connect();
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Database connection error:", error.message);
  }
})();

// Serve static files from dist (frontend build)
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// API Routes
app.use('/api', apiRoutes);

// Serve index.html for all non-API routes (SPA fallback)
app.get('*', (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ message: 'API endpoint not found' });
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    database: prisma ? "connected" : "disconnected"
  });
});

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  console.log(`
🚀 Server running on port ${PORT}
---------------------------------------
API: http://localhost:${PORT}/api
Health: http://localhost:${PORT}/health
---------------------------------------
  `);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("Shutting down...");
  server.close(() => process.exit(0));
});
