const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getOrders = async (req, res) => {
  try {
    // Get orders only for this specific user (isolated by email/userId)
    const orders = await prisma.order.findMany({
      where: { createdById: req.user.userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
};

exports.createOrder = async (req, res) => {
  const { client, items, status, date } = req.body;
  const userId = req.user.userId;

  // 1. Calculate Total
  const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  try {
    // START ATOMIC TRANSACTION
    // This ensures that if Inventory fails, the Order is NOT created.
    const result = await prisma.$transaction(async (tx) => {

      // Step A: Check and Deduct Inventory, and collect itemIds
      const orderItems = [];
      
      for (const item of items) {
        // Build search conditions - only include defined values
        const searchConditions = [];
        
        if (item.itemId) {
          searchConditions.push({ id: item.itemId });
        }
        if (item.name) {
          searchConditions.push({ name: item.name });
        }
        if (item.sku) {
          searchConditions.push({ sku: item.sku });
        }
        
        // If no valid search criteria, skip this item
        if (searchConditions.length === 0) {
          throw new Error(`Invalid item data: ${JSON.stringify(item)}`);
        }
        
        // Find inventory item by id, name, or sku
        const inventoryItem = await tx.inventoryItem.findFirst({
          where: { 
            OR: searchConditions,
            companyName: req.user.companyName
          }
        });

        if (!inventoryItem) {
          throw new Error(`Item not found in inventory: ${item.name || item.sku || item.itemId}. Please check if the item exists in your inventory.`);
        }

        const requestedQty = parseInt(item.quantity);
        if (isNaN(requestedQty) || requestedQty <= 0) {
          throw new Error(`Invalid quantity for ${inventoryItem.name}: ${item.quantity}`);
        }

        if (inventoryItem.quantity < requestedQty) {
          throw new Error(`Insufficient stock for ${inventoryItem.name}. Available: ${inventoryItem.quantity}, Requested: ${requestedQty}`);
        }

        // Deduct stock using atomic decrement to avoid conflicts
        await tx.inventoryItem.update({
          where: { id: inventoryItem.id },
          data: { quantity: { decrement: requestedQty } }
        });
        
        // Store item info for order creation
        const unitPrice = parseFloat(item.price || inventoryItem.price);
        orderItems.push({
          itemId: inventoryItem.id,
          quantity: requestedQty,
          unitPrice: unitPrice,
          totalPrice: unitPrice * requestedQty
        });
      }

      // Step B: Create the Order
      const orderNumber = `ORD-${Date.now()}`;
      const order = await tx.order.create({
        data: {
          orderNumber,
          customerName: client,
          status: status || 'pending',
          totalAmount: total,
          createdById: userId,
          items: {
            create: orderItems
          }
        },
        include: { 
          items: {
            include: {
              item: true
            }
          }
        }
      });

      // Step C: Automatically Record Financial Transaction (Bookkeeping)
      // "Every sale is an income" - requires an accountId
      // Get or create a default sales account
      let salesAccount = await tx.account.findFirst({
        where: { 
          name: 'Sales Revenue', 
          type: 'revenue',
          companyName: req.user.companyName
        }
      });
      
      if (!salesAccount) {
        salesAccount = await tx.account.create({
          data: {
            name: 'Sales Revenue',
            type: 'revenue',
            balance: 0,
            companyName: req.user.companyName
          }
        });
      }
      
      // Update account balance (increase for income)
      await tx.account.update({
        where: { id: salesAccount.id },
        data: { balance: { increment: parseFloat(total) } }
      });
      
      await tx.transaction.create({
        data: {
          description: `Sale Order ${orderNumber} - ${client}`,
          amount: parseFloat(total),
          type: 'income',
          category: 'Sales',
          accountId: salesAccount.id,
          createdBy: userId
        }
      });

      return order;
    });

    res.status(201).json(result);

  } catch (error) {
    console.error("Transaction Failed:", error.message);
    // Return specific business logic error
    if (error.message.includes('Insufficient stock')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error processing order. Transaction rolled back.' });
  }
};