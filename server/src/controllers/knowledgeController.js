const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all articles (public + company specific)
exports.getArticles = async (req, res) => {
  try {
    const { companyName } = req.user;
    const { category, search } = req.query;
    
    const where = {
      OR: [
        { isPublic: true, companyName: null },
        { companyName }
      ]
    };
    
    if (category) {
      where.category = category;
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    const articles = await prisma.knowledgeArticle.findMany({
      where,
      orderBy: { views: 'desc' }
    });
    
    res.json(articles);
  } catch (error) {
    console.error('Get articles error:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
};

// Get single article
exports.getArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const { companyName } = req.user;
    
    const article = await prisma.knowledgeArticle.findFirst({
      where: {
        id,
        OR: [
          { isPublic: true, companyName: null },
          { companyName }
        ]
      }
    });
    
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    // Increment views
    await prisma.knowledgeArticle.update({
      where: { id },
      data: { views: { increment: 1 } }
    });
    
    res.json(article);
  } catch (error) {
    console.error('Get article error:', error);
    res.status(500).json({ error: 'Failed to fetch article' });
  }
};

// Create article (company specific)
exports.createArticle = async (req, res) => {
  try {
    const { companyName, userId } = req.user;
    const { title, content, category, tags, isPublic } = req.body;
    
    if (!title || !content || !category) {
      return res.status(400).json({ error: 'Title, content, and category are required' });
    }
    
    const article = await prisma.knowledgeArticle.create({
      data: {
        title,
        content,
        category,
        tags: tags || [],
        isPublic: isPublic || false,
        companyName: isPublic ? null : companyName,
        authorId: userId
      }
    });
    
    res.status(201).json(article);
  } catch (error) {
    console.error('Create article error:', error);
    res.status(500).json({ error: 'Failed to create article' });
  }
};

// Update article
exports.updateArticle = async (req, res) => {
  try {
    const { companyName, userId } = req.user;
    const { id } = req.params;
    const { title, content, category, tags, isPublic } = req.body;
    
    // Allow editing own articles or company articles
    const article = await prisma.knowledgeArticle.findFirst({
      where: { 
        id,
        OR: [
          { authorId: userId },
          { companyName }
        ]
      }
    });
    
    if (!article) {
      return res.status(404).json({ error: 'Article not found or unauthorized' });
    }
    
    const updated = await prisma.knowledgeArticle.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(category && { category }),
        ...(tags && { tags }),
        ...(typeof isPublic === 'boolean' && { isPublic })
      }
    });
    
    res.json(updated);
  } catch (error) {
    console.error('Update article error:', error);
    res.status(500).json({ error: 'Failed to update article' });
  }
};

// Delete article
exports.deleteArticle = async (req, res) => {
  try {
    const { userId, companyName } = req.user;
    const { id } = req.params;
    
    // Allow deleting own articles or company articles
    const article = await prisma.knowledgeArticle.findFirst({
      where: { 
        id,
        OR: [
          { authorId: userId },
          { companyName }
        ]
      }
    });
    
    if (!article) {
      return res.status(404).json({ error: 'Article not found or unauthorized' });
    }
    
    await prisma.knowledgeArticle.delete({ where: { id } });
    
    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    console.error('Delete article error:', error);
    res.status(500).json({ error: 'Failed to delete article' });
  }
};

// Get categories
exports.getCategories = async (req, res) => {
  try {
    const categories = [
      'Getting Started',
      'Finance',
      'Inventory',
      'HR',
      'Sales',
      'Tax',
      'Payments',
      'Integrations',
      'API',
      'Troubleshooting'
    ];
    
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

// Get stats
exports.getStats = async (req, res) => {
  try {
    const { companyName } = req.user;
    
    const totalArticles = await prisma.knowledgeArticle.count({
      where: {
        OR: [
          { isPublic: true, companyName: null },
          { companyName }
        ]
      }
    });
    
    res.json({
      totalArticles,
      videoTutorials: 12,
      supportAvailable: '24/7'
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};
