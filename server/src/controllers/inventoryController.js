const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getItems = async (req, res) => {
  try {
    const items = await prisma.inventoryItem.findMany({
      where: { companyName: req.user.companyName },
      orderBy: { name: 'asc' }
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching inventory' });
  }
};

exports.createItem = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.companyName) {
      return res.status(401).json({ 
        message: 'Authentication required',
        hint: 'Please log in to create inventory items'
      });
    }

    const { name, sku, category, quantity, unit, price, cost, reorderLevel, description, supplier, location, barcode } = req.body;
    
    // Validate required fields
    if (!name || !sku) {
      return res.status(400).json({ 
        message: 'Name and SKU are required',
        fields: { name: !name, sku: !sku }
      });
    }

    if (!price || isNaN(parseFloat(price))) {
      return res.status(400).json({ 
        message: 'Valid price is required',
        field: 'price'
      });
    }

    // Check if SKU already exists for this company
    const existingItem = await prisma.inventoryItem.findFirst({
      where: { 
        sku,
        companyName: req.user.companyName 
      }
    });

    if (existingItem) {
      return res.status(400).json({ 
        message: `SKU "${sku}" already exists in your company. Please use a unique SKU.`,
        field: 'sku'
      });
    }
    
    const item = await prisma.inventoryItem.create({
      data: {
        name,
        sku,
        category: category || 'General',
        description: description || '',
        quantity: parseInt(quantity) || 0,
        unit: unit || 'pcs',
        price: parseFloat(price),
        cost: parseFloat(cost) || 0,
        reorderLevel: parseInt(reorderLevel) || 10,
        supplier: supplier || '',
        location: location || '',
        barcode: barcode || '',
        companyName: req.user.companyName
      }
    });
    
    res.status(201).json(item);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Inventory Error:', error.message);
    }
    
    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return res.status(400).json({ 
        message: 'SKU already exists. Please use a unique SKU.',
        field: 'sku'
      });
    }
    
    res.status(500).json({ 
      message: 'Error creating inventory item',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
