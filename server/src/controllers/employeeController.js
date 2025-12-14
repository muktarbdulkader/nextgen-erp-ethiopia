const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await prisma.employee.findMany({
      where: { companyName: req.user.companyName },
      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Format response
    const formattedEmployees = employees.map(emp => ({
      id: emp.id,
      firstName: emp.firstName,
      lastName: emp.lastName,
      fullName: `${emp.firstName} ${emp.lastName}`,
      email: emp.email,
      phone: emp.phone,
      position: emp.position,
      department: emp.department,
      salary: emp.salary,
      hireDate: emp.hireDate,
      status: emp.status,
      address: emp.address,
      emergencyContact: emp.emergencyContact,
      bankInfo: emp.bankInfo,
      taxInfo: emp.taxInfo,
      profileImage: emp.profileImage,
      manager: emp.manager ? `${emp.manager.firstName} ${emp.manager.lastName}` : null,
      createdAt: emp.createdAt,
      updatedAt: emp.updatedAt
    }));
    
    res.json(formattedEmployees);
  } catch (error) {
    console.error('Get Employees Error:', error);
    res.status(500).json({ message: 'Error fetching employees' });
  }
};

exports.createEmployee = async (req, res) => {
  try {
    console.log('Create Employee Request Body:', req.body);
    
    const { firstName, lastName, email, phone, position, department, salary, hireDate, address, emergencyContact, bankInfo, taxInfo, profileImage } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email) {
      console.log('Validation failed: Missing name or email');
      return res.status(400).json({ message: 'First name, last name, and email are required' });
    }

    if (!position) {
      console.log('Validation failed: Missing position');
      return res.status(400).json({ message: 'Position is required' });
    }

    if (!department) {
      console.log('Validation failed: Missing department');
      return res.status(400).json({ message: 'Department is required' });
    }

    // Validate salary
    const parsedSalary = parseFloat(salary);
    if (isNaN(parsedSalary) || parsedSalary < 0) {
      console.log('Validation failed: Invalid salary:', salary);
      return res.status(400).json({ message: 'Valid salary is required' });
    }

    // Validate hireDate
    const parsedHireDate = hireDate ? new Date(hireDate) : new Date();
    if (isNaN(parsedHireDate.getTime())) {
      console.log('Validation failed: Invalid hire date:', hireDate);
      return res.status(400).json({ message: 'Valid hire date is required' });
    }
    
    console.log('Validation passed, checking for existing employee...');

    // Check if employee with same email exists in this company
    const existingEmployee = await prisma.employee.findFirst({
      where: {
        email,
        companyName: req.user.companyName
      }
    });

    if (existingEmployee) {
      return res.status(400).json({ message: 'An employee with this email already exists in your company' });
    }

    console.log('Creating employee...');

    const newEmployee = await prisma.employee.create({
      data: {
        firstName,
        lastName,
        email,
        phone: phone || null,
        position,
        department,
        salary: parsedSalary,
        hireDate: parsedHireDate,
        address: address || null,
        emergencyContact: emergencyContact || null,
        bankInfo: bankInfo || null,
        taxInfo: taxInfo || null,
        profileImage: profileImage || null,
        companyName: req.user.companyName,
        managerId: req.user.userId
      },
      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    // Format response
    const formattedEmployee = {
      id: newEmployee.id,
      firstName: newEmployee.firstName,
      lastName: newEmployee.lastName,
      fullName: `${newEmployee.firstName} ${newEmployee.lastName}`,
      email: newEmployee.email,
      phone: newEmployee.phone,
      position: newEmployee.position,
      department: newEmployee.department,
      salary: newEmployee.salary,
      hireDate: newEmployee.hireDate,
      status: newEmployee.status,
      address: newEmployee.address,
      emergencyContact: newEmployee.emergencyContact,
      bankInfo: newEmployee.bankInfo,
      taxInfo: newEmployee.taxInfo,
      profileImage: newEmployee.profileImage,
      manager: newEmployee.manager ? `${newEmployee.manager.firstName} ${newEmployee.manager.lastName}` : null,
      createdAt: newEmployee.createdAt,
      updatedAt: newEmployee.updatedAt
    };

    res.status(201).json(formattedEmployee);
  } catch (error) {
    console.error('Create Employee Error:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      meta: error.meta
    });
    
    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return res.status(400).json({ 
        message: 'Email already exists',
        field: error.meta?.target?.[0] || 'email'
      });
    }
    
    res.status(500).json({ 
      message: 'Error creating employee', 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};


exports.getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const employee = await prisma.employee.findUnique({
      where: { 
        id,
        companyName: req.user.companyName 
      },
      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const formattedEmployee = {
      id: employee.id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      fullName: `${employee.firstName} ${employee.lastName}`,
      email: employee.email,
      phone: employee.phone,
      position: employee.position,
      department: employee.department,
      salary: employee.salary,
      hireDate: employee.hireDate,
      status: employee.status,
      address: employee.address,
      emergencyContact: employee.emergencyContact,
      bankInfo: employee.bankInfo,
      taxInfo: employee.taxInfo,
      manager: employee.manager ? `${employee.manager.firstName} ${employee.manager.lastName}` : null,
      createdAt: employee.createdAt,
      updatedAt: employee.updatedAt
    };

    res.json(formattedEmployee);
  } catch (error) {
    console.error('Get Employee Error:', error);
    res.status(500).json({ message: 'Error fetching employee' });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phone, position, department, salary, status, address, emergencyContact, bankInfo, taxInfo } = req.body;

    const updatedEmployee = await prisma.employee.update({
      where: { 
        id,
        companyName: req.user.companyName 
      },
      data: {
        firstName,
        lastName,
        email,
        phone,
        position,
        department,
        salary: salary ? parseFloat(salary) : undefined,
        status,
        address,
        emergencyContact,
        bankInfo,
        taxInfo
      },
      include: {
        manager: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    const formattedEmployee = {
      id: updatedEmployee.id,
      firstName: updatedEmployee.firstName,
      lastName: updatedEmployee.lastName,
      fullName: `${updatedEmployee.firstName} ${updatedEmployee.lastName}`,
      email: updatedEmployee.email,
      phone: updatedEmployee.phone,
      position: updatedEmployee.position,
      department: updatedEmployee.department,
      salary: updatedEmployee.salary,
      hireDate: updatedEmployee.hireDate,
      status: updatedEmployee.status,
      address: updatedEmployee.address,
      emergencyContact: updatedEmployee.emergencyContact,
      bankInfo: updatedEmployee.bankInfo,
      taxInfo: updatedEmployee.taxInfo,
      manager: updatedEmployee.manager ? `${updatedEmployee.manager.firstName} ${updatedEmployee.manager.lastName}` : null
    };

    res.json(formattedEmployee);
  } catch (error) {
    console.error('Update Employee Error:', error);
    res.status(500).json({ message: 'Error updating employee' });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.employee.delete({
      where: { 
        id,
        companyName: req.user.companyName 
      }
    });

    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Delete Employee Error:', error);
    res.status(500).json({ message: 'Error deleting employee' });
  }
};
