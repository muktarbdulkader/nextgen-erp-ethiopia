const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getTransactions = async (req, res) => {
  try {
    // Get transactions only for this specific user (isolated by email/userId)
    const transactions = await prisma.transaction.findMany({
      where: { createdBy: req.user.userId },
      include: { account: true },
      orderBy: { date: 'desc' }
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transactions' });
  }
};

exports.createTransaction = async (req, res) => {
  try {
    const { description, amount, type, category, date, accountId, reference } = req.body;
    
    // If no accountId provided, get or create a default account for this company
    let finalAccountId = accountId;
    
    if (!finalAccountId) {
      // Try to find a default account for this company
      let defaultAccount = await prisma.account.findFirst({
        where: { 
          companyName: req.user.companyName,
          name: 'General Account'
        }
      });
      
      // If no default account exists, create one
      if (!defaultAccount) {
        defaultAccount = await prisma.account.create({
          data: {
            name: 'General Account',
            type: type === 'income' ? 'revenue' : 'expense',
            balance: 0,
            companyName: req.user.companyName
          }
        });
      }
      
      finalAccountId = defaultAccount.id;
    }
    
    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Create the transaction record
      const transaction = await tx.transaction.create({
        data: {
          description,
          amount: parseFloat(amount),
          type,
          category,
          date: date ? new Date(date) : new Date(),
          accountId: finalAccountId,
          reference,
          createdBy: req.user.userId
        },
        include: { account: true }
      });
      
      // Update account balance
      // Income increases balance, expense decreases balance
      const balanceChange = type === 'income' 
        ? parseFloat(amount) 
        : -parseFloat(amount);
      
      await tx.account.update({
        where: { id: finalAccountId },
        data: { 
          balance: { 
            increment: balanceChange 
          } 
        }
      });
      
      return transaction;
    });
    
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating transaction', error: error.message });
  }
};
