const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'mukti-secret-key-change-me';

exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, companyName, plan } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Use email as the unique identifier for data isolation
    // Each user's data is isolated by their email
    const finalCompanyName = companyName || email;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`📝 Register: ${email} → Company: ${finalCompanyName}`);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user - email is the unique identifier
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        companyName: finalCompanyName,
        plan: plan || 'Starter'
      }
    });

    // Create Token with email as primary identifier
    const token = jwt.sign({ 
      userId: user.id, 
      email: user.email, 
      companyName: user.companyName 
    }, JWT_SECRET, { expiresIn: '30d' });



    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json({ token, user: userWithoutPassword });

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

    // Create Token with companyName for multi-tenancy
    const token = jwt.sign({ 
      userId: user.id, 
      email: user.email, 
      companyName: user.companyName 
    }, JWT_SECRET, { expiresIn: '30d' });

    if (process.env.NODE_ENV === 'development') {
      console.log(`🔐 Login: ${user.email}`);
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Login Error:', error.message);
    }
    res.status(500).json({ message: 'Server error during login' });
  }
};
