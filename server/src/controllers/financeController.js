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
    const { description, amount, type, category, date, accountId, reference, status, paymentMethod } = req.body;
    
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
    
    // Default status is 'pending' - requires approval
    const transactionStatus = status || 'pending';
    
    // Create the transaction record (pending by default)
    const transaction = await prisma.transaction.create({
      data: {
        description,
        amount: parseFloat(amount),
        type,
        category,
        date: date ? new Date(date) : new Date(),
        accountId: finalAccountId,
        reference,
        status: transactionStatus,
        paymentMethod: paymentMethod || null,
        createdBy: req.user.userId
      },
      include: { account: true }
    });
    
    // Only update account balance if status is 'paid' (immediate payment)
    if (transactionStatus === 'paid') {
      const balanceChange = type === 'income' 
        ? parseFloat(amount) 
        : -parseFloat(amount);
      
      await prisma.account.update({
        where: { id: finalAccountId },
        data: { 
          balance: { 
            increment: balanceChange 
          } 
        }
      });
    }
    
    res.status(201).json(transaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating transaction', error: error.message });
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, description, amount, category, date } = req.body;
    
    // Verify transaction belongs to this user
    const existingTx = await prisma.transaction.findFirst({
      where: { 
        id,
        createdBy: req.user.userId
      },
      include: { account: true }
    });
    
    if (!existingTx) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    // If changing status from pending to paid, update account balance
    if (status === 'paid' && existingTx.status === 'pending') {
      await prisma.$transaction(async (tx) => {
        // Update transaction status
        await tx.transaction.update({
          where: { id },
          data: { status: 'paid' }
        });
        
        // Update account balance (income adds, expense subtracts)
        const balanceChange = existingTx.type === 'income' 
          ? existingTx.amount 
          : -existingTx.amount;
        
        if (existingTx.accountId) {
          await tx.account.update({
            where: { id: existingTx.accountId },
            data: { 
              balance: { increment: balanceChange } 
            }
          });
        }
      });
    } else {
      // Regular update without balance change
      await prisma.transaction.update({
        where: { id },
        data: {
          ...(status && { status }),
          ...(description && { description }),
          ...(amount && { amount: parseFloat(amount) }),
          ...(category && { category }),
          ...(date && { date: new Date(date) })
        }
      });
    }
    
    // Fetch updated transaction
    const updatedTx = await prisma.transaction.findUnique({
      where: { id },
      include: { account: true }
    });
    
    res.json(updatedTx);
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ message: 'Error updating transaction', error: error.message });
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify transaction belongs to this user
    const existingTx = await prisma.transaction.findFirst({
      where: { 
        id,
        createdBy: req.user.userId
      }
    });
    
    if (!existingTx) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    // If transaction was paid, reverse the balance change
    if (existingTx.status === 'paid' && existingTx.accountId) {
      await prisma.$transaction(async (tx) => {
        // Reverse balance change
        const balanceChange = existingTx.type === 'income' 
          ? -existingTx.amount 
          : existingTx.amount;
        
        await tx.account.update({
          where: { id: existingTx.accountId },
          data: { 
            balance: { increment: balanceChange } 
          }
        });
        
        // Delete transaction
        await tx.transaction.delete({
          where: { id }
        });
      });
    } else {
      await prisma.transaction.delete({
        where: { id }
      });
    }
    
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ message: 'Error deleting transaction', error: error.message });
  }
};
