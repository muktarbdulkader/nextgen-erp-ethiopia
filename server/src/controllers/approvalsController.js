const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper to safely query a model
const safeQuery = async (queryFn) => {
  try {
    return await queryFn();
  } catch (error) {
    console.log('Query skipped:', error.message);
    return [];
  }
};

// Get all pending items across modules for admin approval
exports.getPendingApprovals = async (req, res) => {
  try {
    const { companyName, userId } = req.user;
    
    // Fetch pending items from all modules in parallel with error handling
    const [
      pendingTransactions,
      pendingExpenses,
      pendingPayrolls,
      pendingOrders,
      pendingProcurements,
      pendingTeamInvites
    ] = await Promise.all([
      // Finance transactions
      safeQuery(() => prisma.transaction.findMany({
        where: { 
          createdBy: userId,
          status: 'pending'
        },
        orderBy: { createdAt: 'desc' },
        take: 50
      })),
      
      // Expenses
      safeQuery(() => prisma.expense.findMany({
        where: { 
          companyName,
          status: 'Pending'
        },
        orderBy: { createdAt: 'desc' },
        take: 50
      })),
      
      // Payroll
      safeQuery(() => prisma.payroll.findMany({
        where: { 
          companyName,
          status: { in: ['Pending', 'Processed'] }
        },
        orderBy: { createdAt: 'desc' },
        take: 50
      })),
      
      // Sales Orders (pending or processing)
      safeQuery(() => prisma.order.findMany({
        where: { 
          status: { in: ['pending', 'Pending', 'processing', 'Processing'] }
        },
        orderBy: { createdAt: 'desc' },
        take: 50
      })),
      
      // Procurement
      safeQuery(() => prisma.purchaseOrder.findMany({
        where: { 
          companyName,
          status: { in: ['Pending', 'Requested'] }
        },
        orderBy: { createdAt: 'desc' },
        take: 50
      })),
      
      // Team Invites
      safeQuery(() => prisma.teamMember.findMany({
        where: { 
          companyName,
          status: 'Pending'
        },
        orderBy: { createdAt: 'desc' },
        take: 50
      }))
    ]);

    // Format and combine all pending items
    const approvals = [
      ...pendingTransactions.map(item => ({
        id: item.id,
        type: 'transaction',
        module: 'Finance',
        title: item.description,
        amount: item.amount,
        status: item.status,
        date: item.createdAt,
        details: {
          category: item.category,
          transactionType: item.type
        }
      })),
      
      ...pendingExpenses.map(item => ({
        id: item.id,
        type: 'expense',
        module: 'Expenses',
        title: item.title || item.description,
        amount: item.amount,
        status: item.status,
        date: item.createdAt,
        details: {
          category: item.category,
          submittedBy: item.submittedBy
        }
      })),
      
      ...pendingPayrolls.map(item => ({
        id: item.id,
        type: 'payroll',
        module: 'Payroll',
        title: `Payroll - ${item.month}`,
        amount: item.netSalary,
        status: item.status,
        date: item.createdAt,
        details: {
          employeeId: item.employeeId,
          month: item.month,
          basicSalary: item.basicSalary
        }
      })),
      
      ...pendingOrders.map(item => ({
        id: item.id,
        type: 'order',
        module: 'Sales',
        title: `Order #${item.orderNumber} - ${item.customerName}`,
        amount: item.totalAmount,
        status: item.status,
        date: item.createdAt,
        details: {
          customerName: item.customerName,
          orderNumber: item.orderNumber
        }
      })),
      
      ...pendingProcurements.map(item => ({
        id: item.id,
        type: 'procurement',
        module: 'Procurement',
        title: `PO #${item.orderNumber} - ${item.supplier}`,
        amount: item.totalAmount,
        status: item.status,
        date: item.createdAt,
        details: {
          supplier: item.supplier,
          orderNumber: item.orderNumber
        }
      })),
      
      ...pendingTeamInvites.map(item => ({
        id: item.id,
        type: 'invite',
        module: 'Team',
        title: `Team Invite - ${item.email}`,
        amount: null,
        status: item.status,
        date: item.createdAt,
        details: {
          email: item.email,
          role: item.role
        }
      }))
    ];

    // Sort by date (newest first)
    approvals.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Get summary counts
    const summary = {
      total: approvals.length,
      byModule: {
        finance: pendingTransactions.length,
        expenses: pendingExpenses.length,
        payroll: pendingPayrolls.length,
        sales: pendingOrders.length,
        procurement: pendingProcurements.length,
        team: pendingTeamInvites.length
      }
    };

    res.json({ approvals, summary });
  } catch (error) {
    console.error('Get pending approvals error:', error);
    res.status(500).json({ message: 'Error fetching pending approvals', error: error.message });
  }
};

// Approve an item
exports.approveItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body;
    const { companyName, userId } = req.user;

    let result;

    switch (type) {
      case 'transaction':
        const tx = await prisma.transaction.findFirst({ where: { id, createdBy: userId } });
        if (!tx) return res.status(404).json({ message: 'Transaction not found' });
        
        await prisma.$transaction(async (prismaClient) => {
          await prismaClient.transaction.update({
            where: { id },
            data: { status: 'paid' }
          });
          
          if (tx.accountId) {
            const balanceChange = tx.type === 'income' ? tx.amount : -tx.amount;
            await prismaClient.account.update({
              where: { id: tx.accountId },
              data: { balance: { increment: balanceChange } }
            });
          }
        });
        result = { message: 'Transaction approved' };
        break;

      case 'expense':
        await prisma.expense.update({
          where: { id },
          data: { status: 'Approved' }
        });
        result = { message: 'Expense approved' };
        break;

      case 'payroll':
        await prisma.payroll.update({
          where: { id },
          data: { status: 'Paid', paymentDate: new Date() }
        });
        result = { message: 'Payroll approved and marked as paid' };
        break;

      case 'order':
        // Get order with items
        const order = await prisma.order.findUnique({
          where: { id },
          include: { items: true }
        });
        
        if (!order) return res.status(404).json({ message: 'Order not found' });
        
        await prisma.$transaction(async (tx) => {
          // Step 1: Deduct inventory for each item
          for (const orderItem of order.items) {
            const inventoryItem = await tx.inventoryItem.findUnique({
              where: { id: orderItem.itemId }
            });
            
            if (!inventoryItem) {
              throw new Error(`Inventory item not found: ${orderItem.itemId}`);
            }
            
            if (inventoryItem.quantity < orderItem.quantity) {
              throw new Error(`Insufficient stock for ${inventoryItem.name}. Available: ${inventoryItem.quantity}, Requested: ${orderItem.quantity}`);
            }
            
            // Deduct stock
            await tx.inventoryItem.update({
              where: { id: orderItem.itemId },
              data: { quantity: { decrement: orderItem.quantity } }
            });
          }
          
          // Step 2: Record financial transaction
          let salesAccount = await tx.account.findFirst({
            where: { 
              name: 'Sales Revenue', 
              type: 'revenue',
              companyName
            }
          });
          
          if (!salesAccount) {
            salesAccount = await tx.account.create({
              data: {
                name: 'Sales Revenue',
                type: 'revenue',
                balance: 0,
                companyName
              }
            });
          }
          
          // Update account balance
          await tx.account.update({
            where: { id: salesAccount.id },
            data: { balance: { increment: order.totalAmount } }
          });
          
          // Create transaction record
          await tx.transaction.create({
            data: {
              description: `Sale Order ${order.orderNumber} - ${order.customerName}`,
              amount: order.totalAmount,
              type: 'income',
              category: 'Sales',
              accountId: salesAccount.id,
              createdBy: userId
            }
          });
          
          // Step 3: Update order status to Completed
          await tx.order.update({
            where: { id },
            data: { status: 'Completed' }
          });
        });
        
        result = { message: 'Order approved - inventory deducted and sale recorded' };
        break;

      case 'procurement':
        await prisma.purchaseOrder.update({
          where: { id },
          data: { status: 'Approved' }
        });
        result = { message: 'Procurement approved' };
        break;

      case 'invite':
        await prisma.teamMember.update({
          where: { id },
          data: { status: 'Active' }
        });
        result = { message: 'Team invite approved' };
        break;

      default:
        return res.status(400).json({ message: 'Invalid approval type' });
    }

    res.json(result);
  } catch (error) {
    console.error('Approve item error:', error);
    res.status(500).json({ message: 'Error approving item', error: error.message });
  }
};

// Reject an item
exports.rejectItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, reason } = req.body;

    let result;

    switch (type) {
      case 'transaction':
        await prisma.transaction.update({
          where: { id },
          data: { status: 'rejected' }
        });
        result = { message: 'Transaction rejected' };
        break;

      case 'expense':
        await prisma.expense.update({
          where: { id },
          data: { status: 'Rejected' }
        });
        result = { message: 'Expense rejected' };
        break;

      case 'payroll':
        await prisma.payroll.update({
          where: { id },
          data: { status: 'Cancelled' }
        });
        result = { message: 'Payroll cancelled' };
        break;

      case 'order':
        await prisma.order.update({
          where: { id },
          data: { status: 'Cancelled' }
        });
        result = { message: 'Order cancelled' };
        break;

      case 'procurement':
        await prisma.purchaseOrder.update({
          where: { id },
          data: { status: 'Rejected' }
        });
        result = { message: 'Procurement rejected' };
        break;

      case 'invite':
        await prisma.teamMember.delete({
          where: { id }
        });
        result = { message: 'Team invite rejected and removed' };
        break;

      default:
        return res.status(400).json({ message: 'Invalid rejection type' });
    }

    res.json(result);
  } catch (error) {
    console.error('Reject item error:', error);
    res.status(500).json({ message: 'Error rejecting item', error: error.message });
  }
};
