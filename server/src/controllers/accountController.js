const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAccounts = async (req, res) => {
  try {
    const accounts = await prisma.account.findMany({
      where: { companyName: req.user.companyName },
      orderBy: { createdAt: 'asc' }
    });
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching accounts' });
  }
};

exports.createAccount = async (req, res) => {
  try {
    const { name, type, balance, accountNumber, bankName, branch } = req.body;
    
    const account = await prisma.account.create({
      data: {
        name,
        type,
        balance: parseFloat(balance) || 0,
        accountNumber,
        bankName,
        branch,
        companyName: req.user.companyName
      }
    });
    res.status(201).json(account);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating account' });
  }
};

exports.updateAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, balance, accountNumber, bankName, branch } = req.body;

    // First verify the account belongs to this company
    const existingAccount = await prisma.account.findFirst({
      where: { 
        id,
        companyName: req.user.companyName
      }
    });
    
    if (!existingAccount) {
      return res.status(404).json({ message: 'Account not found' });
    }

    const account = await prisma.account.update({
      where: { id },
      data: {
        name,
        type,
        balance: parseFloat(balance) || existingAccount.balance,
        accountNumber,
        bankName,
        branch
      }
    });
    res.json(account);
  } catch (error) {
    console.error('Update account error:', error);
    res.status(500).json({ message: 'Error updating account', error: error.message });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;
    
    // First verify the account belongs to this company
    const account = await prisma.account.findFirst({
      where: { 
        id,
        companyName: req.user.companyName
      }
    });
    
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }
    
    // Check if account has transactions
    const transactionCount = await prisma.transaction.count({
      where: { accountId: id }
    });
    
    if (transactionCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete account with ${transactionCount} transaction(s). Please delete or reassign transactions first.` 
      });
    }
    
    await prisma.account.delete({
      where: { id }
    });
    
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Error deleting account', error: error.message });
  }
};
