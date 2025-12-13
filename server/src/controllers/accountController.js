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

    const account = await prisma.account.update({
      where: { 
        id,
        companyName: req.user.companyName // Ensure user can only update their company's accounts
      },
      data: {
        name,
        type,
        balance: parseFloat(balance),
        accountNumber,
        bankName,
        branch
      }
    });
    res.json(account);
  } catch (error) {
    res.status(500).json({ message: 'Error updating account' });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.account.delete({
      where: { 
        id,
        companyName: req.user.companyName
      }
    });
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting account' });
  }
};
