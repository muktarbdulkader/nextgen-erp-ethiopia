const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all expenses
exports.getExpenses = async (req, res) => {
  try {
    const { companyName } = req.user;

    const expenses = await prisma.expense.findMany({
      where: { companyName },
      orderBy: { createdAt: 'desc' }
    });

    res.json(expenses);
  } catch (error) {
    console.error('Get Expenses Error:', error);
    res.status(500).json({ message: 'Error fetching expenses' });
  }
};

// Create expense
exports.createExpense = async (req, res) => {
  try {
    const { companyName, userId } = req.user;
    const { title, amount, category, date, description, employeeId, receipt } = req.body;

    const expense = await prisma.expense.create({
      data: {
        title,
        amount,
        category,
        date: date ? new Date(date) : new Date(),
        description,
        employeeId,
        receipt,
        companyName,
        userId
      }
    });

    res.status(201).json(expense);
  } catch (error) {
    console.error('Create Expense Error:', error);
    res.status(500).json({ message: 'Error creating expense' });
  }
};

// Update expense (approve/reject)
exports.updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { companyName } = req.user;
    const { status } = req.body;

    const expense = await prisma.expense.updateMany({
      where: { id, companyName },
      data: { status }
    });

    res.json({ message: 'Expense updated successfully', expense });
  } catch (error) {
    console.error('Update Expense Error:', error);
    res.status(500).json({ message: 'Error updating expense' });
  }
};

// Get expense stats
exports.getStats = async (req, res) => {
  try {
    const { companyName } = req.user;

    const expenses = await prisma.expense.findMany({ where: { companyName } });
    
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const pending = expenses.filter(e => e.status === 'Pending').length;
    const approved = expenses.filter(e => e.status === 'Approved').length;

    res.json({
      totalExpenses,
      pending,
      approved,
      count: expenses.length
    });
  } catch (error) {
    console.error('Get Expense Stats Error:', error);
    res.status(500).json({ message: 'Error fetching expense stats' });
  }
};
