const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all payroll records
exports.getPayrolls = async (req, res) => {
  try {
    const { companyName } = req.user;
    const { month } = req.query;

    const where = { companyName };
    if (month) where.month = month;

    const payrolls = await prisma.payroll.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    res.json(payrolls);
  } catch (error) {
    console.error('Get Payrolls Error:', error);
    res.status(500).json({ message: 'Error fetching payrolls' });
  }
};

// Create/Process payroll
exports.createPayroll = async (req, res) => {
  try {
    const { companyName, userId } = req.user;
    const { employeeId, month, basicSalary, allowances, deductions } = req.body;

    // Calculate tax (simplified Ethiopian tax calculation)
    const grossSalary = basicSalary + (allowances || 0);
    let tax = 0;
    
    if (grossSalary > 10900) {
      tax = (grossSalary - 10900) * 0.35 + 2220;
    } else if (grossSalary > 7800) {
      tax = (grossSalary - 7800) * 0.30 + 1290;
    } else if (grossSalary > 5250) {
      tax = (grossSalary - 5250) * 0.25 + 652.50;
    } else if (grossSalary > 3550) {
      tax = (grossSalary - 3550) * 0.20 + 302.50;
    } else if (grossSalary > 1650) {
      tax = (grossSalary - 1650) * 0.15 + 17.50;
    } else if (grossSalary > 600) {
      tax = (grossSalary - 600) * 0.10;
    }

    const netSalary = grossSalary - tax - (deductions || 0);

    const payroll = await prisma.payroll.create({
      data: {
        employeeId,
        month,
        basicSalary,
        allowances: allowances || 0,
        deductions: deductions || 0,
        tax,
        netSalary,
        companyName,
        userId
      }
    });

    res.status(201).json(payroll);
  } catch (error) {
    console.error('Create Payroll Error:', error);
    res.status(500).json({ message: 'Error creating payroll' });
  }
};

// Update payroll status
exports.updatePayroll = async (req, res) => {
  try {
    const { id } = req.params;
    const { companyName } = req.user;
    const { status, paymentDate } = req.body;

    const payroll = await prisma.payroll.updateMany({
      where: { id, companyName },
      data: { 
        status,
        paymentDate: paymentDate ? new Date(paymentDate) : null
      }
    });

    res.json({ message: 'Payroll updated successfully', payroll });
  } catch (error) {
    console.error('Update Payroll Error:', error);
    res.status(500).json({ message: 'Error updating payroll' });
  }
};

// Get payroll stats
exports.getStats = async (req, res) => {
  try {
    const { companyName } = req.user;
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

    const payrolls = await prisma.payroll.findMany({ 
      where: { companyName, month: currentMonth } 
    });
    
    const totalPayroll = payrolls.reduce((sum, p) => sum + p.netSalary, 0);
    const processed = payrolls.filter(p => p.status === 'Processed').length;
    const paid = payrolls.filter(p => p.status === 'Paid').length;

    res.json({
      totalPayroll,
      processed,
      paid,
      count: payrolls.length
    });
  } catch (error) {
    console.error('Get Payroll Stats Error:', error);
    res.status(500).json({ message: 'Error fetching payroll stats' });
  }
};
