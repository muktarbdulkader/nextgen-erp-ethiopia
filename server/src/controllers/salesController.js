const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getOrders = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Get orders only for this specific user (isolated by email/userId)
    const orders = await prisma.order.findMany({
      where: { createdById: req.user.userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
};

exports.createOrder = async (req, res) => {
  const { client, items, status, date } = req.body;
  const userId = req.user.userId;
  const companyName = req.user.companyName;

  // Calculate Total
  const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Step A: Validate items exist in inventory (but DON'T deduct yet)
      const orderItems = [];
      
      for (const item of items) {
        const searchConditions = [];
        
        if (item.itemId) searchConditions.push({ id: item.itemId });
        if (item.name) searchConditions.push({ name: item.name });
        if (item.sku) searchConditions.push({ sku: item.sku });
        
        if (searchConditions.length === 0) {
          throw new Error(`Invalid item data: ${JSON.stringify(item)}`);
        }
        
        // Find inventory item
        const inventoryItem = await tx.inventoryItem.findFirst({
          where: { 
            OR: searchConditions,
            companyName
          }
        });

        if (!inventoryItem) {
          throw new Error(`Item not found in inventory: ${item.name || item.sku || item.itemId}`);
        }

        const requestedQty = parseInt(item.quantity);
        if (isNaN(requestedQty) || requestedQty <= 0) {
          throw new Error(`Invalid quantity for ${inventoryItem.name}: ${item.quantity}`);
        }

        // Check stock availability (but don't deduct - will deduct on approval)
        if (inventoryItem.quantity < requestedQty) {
          throw new Error(`Insufficient stock for ${inventoryItem.name}. Available: ${inventoryItem.quantity}, Requested: ${requestedQty}`);
        }
        
        const unitPrice = parseFloat(item.price || inventoryItem.price);
        orderItems.push({
          itemId: inventoryItem.id,
          quantity: requestedQty,
          unitPrice: unitPrice,
          totalPrice: unitPrice * requestedQty
        });
      }

      // Step B: Create the Order with "Processing" status (pending approval)
      const orderNumber = `ORD-${Date.now()}`;
      const order = await tx.order.create({
        data: {
          orderNumber,
          customerName: client,
          status: 'Processing', // Will be approved later, then inventory deducted
          totalAmount: total,
          createdById: userId,
          items: {
            create: orderItems
          }
        },
        include: { 
          items: {
            include: { item: true }
          }
        }
      });

      // NOTE: Inventory deduction and financial transaction will happen on APPROVAL
      return order;
    });

    res.status(201).json(result);

  } catch (error) {
    console.error("Order creation failed:", error.message);
    if (error.message.includes('Insufficient stock') || error.message.includes('not found')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error creating order.' });
  }
};