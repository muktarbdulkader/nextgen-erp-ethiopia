const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all purchase orders
exports.getPurchaseOrders = async (req, res) => {
  try {
    const { companyName } = req.user;

    const orders = await prisma.purchaseOrder.findMany({
      where: { companyName },
      orderBy: { createdAt: 'desc' }
    });

    res.json(orders);
  } catch (error) {
    console.error('Get Purchase Orders Error:', error);
    res.status(500).json({ message: 'Error fetching purchase orders' });
  }
};

// Create purchase order
exports.createPurchaseOrder = async (req, res) => {
  try {
    const { companyName, userId } = req.user;
    const { supplier, totalAmount, items, deliveryDate, notes } = req.body;

    // Generate order number
    const count = await prisma.purchaseOrder.count({ where: { companyName } });
    const orderNumber = `PO-${Date.now()}-${count + 1}`;

    const order = await prisma.purchaseOrder.create({
      data: {
        orderNumber,
        supplier,
        totalAmount,
        items,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
        notes,
        companyName,
        userId
      }
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('Create Purchase Order Error:', error);
    res.status(500).json({ message: 'Error creating purchase order' });
  }
};

// Update purchase order
exports.updatePurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { companyName } = req.user;
    const data = req.body;

    const order = await prisma.purchaseOrder.updateMany({
      where: { id, companyName },
      data
    });

    res.json({ message: 'Purchase order updated successfully', order });
  } catch (error) {
    console.error('Update Purchase Order Error:', error);
    res.status(500).json({ message: 'Error updating purchase order' });
  }
};
