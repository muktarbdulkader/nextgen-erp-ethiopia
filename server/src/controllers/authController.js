const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'mukti-secret-key-change-me';

// Default access codes from environment (used for first registration)
const DEFAULT_ADMIN_CODE = process.env.ADMIN_ACCESS_CODE || 'mukti123';
const DEFAULT_MANAGER_CODE = process.env.MANAGER_ACCESS_CODE || 'mukti1234';

// Default roles with permissions
const DEFAULT_ROLES = [
  { name: 'Admin', permissions: ['Full Access', 'User Management', 'Settings', 'Billing', 'View Reports', 'Manage Team', 'Edit Data', 'Approve Requests', 'View Data', 'Create Records', 'Edit Own Records'], isDefault: true },
  { name: 'Manager', permissions: ['View Reports', 'Manage Team', 'Edit Data', 'Approve Requests', 'View Data', 'Create Records', 'Edit Own Records'], isDefault: true },
  { name: 'User', permissions: ['View Data', 'Create Records', 'Edit Own Records'], isDefault: true },
  { name: 'Viewer', permissions: ['View Data Only'], isDefault: true }
];

// Initialize default roles for a company
async function initializeDefaultRoles(companyName) {
  const existingRoles = await prisma.role.findMany({ where: { companyName } });
  
  if (existingRoles.length === 0) {
    await prisma.role.createMany({
      data: DEFAULT_ROLES.map(role => ({
        ...role,
        companyName
      }))
    });
  }
}

exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, companyName, plan, role, adminCode } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // IMPORTANT: Use email as the unique identifier for data isolation
    // This ensures each user's data is completely separate even if they use the same company name
    const finalCompanyName = email; // Always use email for data isolation
    
    // Validate role - only allow valid roles
    const validRoles = ['Admin', 'Manager', 'User', 'Viewer'];
    let selectedRole = validRoles.includes(role) ? role : 'User';
    
    // For Admin/Manager roles, verify access code
    if (selectedRole === 'Admin' || selectedRole === 'Manager') {
      if (!adminCode || adminCode.length < 6) {
        return res.status(400).json({ message: 'Access code must be at least 6 characters' });
      }
      
      // Check if company already has a custom access code for this role
      const existingCode = await prisma.companyAccessCode.findUnique({
        where: { companyName_role: { companyName: finalCompanyName, role: selectedRole } }
      });
      
      if (existingCode) {
        // Company has custom code - verify against it
        const isValidCode = await bcrypt.compare(adminCode, existingCode.code);
        if (!isValidCode) {
          return res.status(403).json({ 
            message: `Invalid ${selectedRole.toLowerCase()} access code for this company. Contact your administrator.` 
          });
        }
      } else {
        // No custom code - verify against default codes from .env
        const defaultCode = selectedRole === 'Admin' ? DEFAULT_ADMIN_CODE : DEFAULT_MANAGER_CODE;
        if (adminCode !== defaultCode) {
          return res.status(403).json({ 
            message: `Invalid ${selectedRole.toLowerCase()} access code. Contact your system administrator.` 
          });
        }
      }
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`📝 Register: ${email} → Company: ${finalCompanyName} → Role: ${selectedRole}`);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user with selected role
    // companyName = email (for data isolation, always unique)
    // displayCompanyName = the actual company name user entered (for display purposes)
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        companyName: finalCompanyName, // Always email for data isolation
        displayCompanyName: companyName || null, // Store actual company name for display
        plan: plan || 'Starter',
        role: selectedRole
      }
    });

    // Initialize default roles for this company
    await initializeDefaultRoles(finalCompanyName);

    // If Admin/Manager and first one for this company, save the access code
    if ((selectedRole === 'Admin' || selectedRole === 'Manager') && adminCode) {
      const existingCode = await prisma.companyAccessCode.findUnique({
        where: { companyName_role: { companyName: finalCompanyName, role: selectedRole } }
      });
      
      if (!existingCode) {
        // Hash and save the access code for future registrations
        const hashedCode = await bcrypt.hash(adminCode, 10);
        await prisma.companyAccessCode.create({
          data: {
            companyName: finalCompanyName,
            role: selectedRole,
            code: hashedCode,
            createdBy: user.id
          }
        });
        console.log(`🔐 Created ${selectedRole} access code for company: ${finalCompanyName}`);
      }
    }

    // Get user's role permissions
    const roleData = await prisma.role.findUnique({
      where: { name_companyName: { name: selectedRole, companyName: finalCompanyName } }
    });

    const permissions = roleData?.permissions || DEFAULT_ROLES.find(r => r.name === selectedRole)?.permissions || ['View Data'];

    // Create Token with role and permissions
    const token = jwt.sign({ 
      userId: user.id, 
      email: user.email, 
      companyName: user.companyName, // email for data isolation
      displayCompanyName: user.displayCompanyName, // actual company name for display
      role: user.role,
      permissions
    }, JWT_SECRET, { expiresIn: '30d' });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json({ token, user: { ...userWithoutPassword, permissions } });

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Register Error:', error.message);
    }
    res.status(500).json({ message: 'Server error during registration' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Get user's role permissions from database
    const roleData = await prisma.role.findUnique({
      where: { name_companyName: { name: user.role || 'User', companyName: user.companyName } }
    });

    const permissions = roleData?.permissions || ['View Data'];

    // Create Token with role and permissions
    const token = jwt.sign({ 
      userId: user.id, 
      email: user.email, 
      companyName: user.companyName, // email for data isolation
      displayCompanyName: user.displayCompanyName, // actual company name for display
      role: user.role || 'User',
      permissions
    }, JWT_SECRET, { expiresIn: '30d' });

    if (process.env.NODE_ENV === 'development') {
      console.log(`🔐 Login: ${user.email} (${user.role})`);
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json({ token, user: { ...userWithoutPassword, permissions } });

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Login Error:', error.message);
    }
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Get current user info with permissions
exports.getMe = async (req, res) => {
  try {
    const { userId, companyName } = req.user;
    
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get role permissions
    const roleData = await prisma.role.findUnique({
      where: { name_companyName: { name: user.role || 'User', companyName: user.companyName } }
    });

    const { password: _, ...userWithoutPassword } = user;
    res.json({ 
      ...userWithoutPassword, 
      permissions: roleData?.permissions || ['View Data']
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
