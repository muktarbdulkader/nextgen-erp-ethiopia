// =============================================
// DASHBOARD CONTROLLER — FULLY FIXED VERSION
// =============================================
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getStats = async (req, res) => {
  try {
    // ---------------------------
    // AUTH CHECK
    // ---------------------------
    if (!req.user || !req.user.userId) {
      console.error("❌ No authenticated user found");
      return res.status(401).json({ message: "Authentication required" });
    }

    const userId = req.user.userId;
    
    // Get user's company for inventory filtering
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { companyName: true }
    });

    // ---------------------------
    // PARALLEL DATABASE QUERIES
    // ---------------------------
    const [
      transactions,
      lowStockItems,
      pendingOrders,
      completedOrders,
      totalOrders,
      activeClients,
      totalEmployees,
      accounts,
      inventoryValue,
      recentTransactions
    ] = await Promise.all([
      // GET INCOME + EXPENSE TRANSACTIONS (ONLY THIS USER)
      prisma.transaction.findMany({
        where: {
          createdBy: userId,
          type: { in: ["income", "expense"] }
        },
        select: {
          type: true,
          amount: true,
          date: true
        }
      }),

      // LOW STOCK < 10 (USER'S COMPANY)
      prisma.inventoryItem.count({
        where: { 
          companyName: user.companyName,
          quantity: { lte: 10 } 
        }
      }),

      // PENDING ORDERS (ONLY THIS USER)
      prisma.order.count({
        where: {
          createdById: userId,
          status: "pending"
        }
      }),

      // COMPLETED ORDERS (ONLY THIS USER)
      prisma.order.count({
        where: {
          createdById: userId,
          status: { in: ["completed", "delivered"] }
        }
      }),

      // TOTAL ORDERS (ONLY THIS USER)
      prisma.order.count({
        where: {
          createdById: userId
        }
      }),

      // Get unique clients from orders
      prisma.order.findMany({
        where: { createdById: userId },
        select: { customerName: true },
        distinct: ['customerName']
      }),

      // EMPLOYEES IN COMPANY (USER'S COMPANY)
      prisma.employee.count({
        where: { companyName: user.companyName }
      }),

      // GET ALL ACCOUNTS WITH BALANCES (USER'S COMPANY)
      prisma.account.findMany({
        where: { companyName: user.companyName },
        select: {
          id: true,
          name: true,
          type: true,
          balance: true
        }
      }),

      // CALCULATE INVENTORY VALUE (USER'S COMPANY)
      prisma.inventoryItem.aggregate({
        where: { companyName: user.companyName },
        _sum: {
          cost: true
        }
      }),

      // RECENT TRANSACTIONS (last 5, ONLY THIS USER)
      prisma.transaction.findMany({
        where: { createdBy: userId },
        include: { 
          account: { select: { name: true } },
          user: { select: { firstName: true, lastName: true } }
        },
        orderBy: { date: 'desc' },
        take: 5
      })
    ]);

    // ---------------------------
    // CALCULATE REVENUE + EXPENSE
    // ---------------------------
    const revenue = transactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const expense = transactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const profit = revenue - expense;

    // Calculate total account balances
    const totalBalance = accounts.reduce((sum, acc) => sum + (Number(acc.balance) || 0), 0);

    // ---------------------------
    // RESPONSE
    // ---------------------------
    return res.json({
      // Financial Stats
      revenue,
      expense,
      profit,
      totalBalance,
      accounts: accounts.map(acc => ({
        id: acc.id,
        name: acc.name,
        type: acc.type,
        balance: acc.balance
      })),
      
      // Inventory Stats
      lowStockCount: lowStockItems,
      inventoryValue: inventoryValue._sum.cost || 0,
      
      // Order Stats
      pendingOrders,
      completedOrders,
      totalOrders,
      
      // HR Stats
      totalEmployees,
      activeClients: activeClients.length,
      
      // Recent Activity
      recentTransactions: recentTransactions.map(t => ({
        id: t.id,
        description: t.description,
        amount: t.amount,
        type: t.type,
        category: t.category,
        account: t.account.name,
        createdBy: `${t.user.firstName} ${t.user.lastName}`,
        date: t.date
      }))
    });

  } catch (error) {
    console.error("🔥 Stats Error:", error);
    console.error("Error details:", error.message);
    return res.status(500).json({ message: "Error fetching stats", error: error.message });
  }
};
