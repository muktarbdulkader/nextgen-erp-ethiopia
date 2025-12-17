const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient();

// Chapa API Configuration
const CHAPA_PUBLIC_KEY = process.env.CHAPA_PUBLIC_KEY;
const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY;
const CHAPA_ENCRYPTION_KEY = process.env.CHAPA_ENCRYPTION_KEY;
const CHAPA_BASE_URL = process.env.CHAPA_BASE_URL || 'https://api.chapa.co/v1';

// Check if using test mode
const isTestMode = CHAPA_SECRET_KEY?.includes('TEST') || !CHAPA_SECRET_KEY;

/* ============================
   INITIALIZE PAYMENT
============================ */

exports.initializePayment = async (req, res) => {
  try {
    const { amount, email, firstName, lastName, description, category, type = 'order' } = req.body;
    
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }

    // Generate unique transaction reference
    const txRef = `MUKTI-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // For subscription payments, don't create transaction record
    if (type !== 'subscription' && type !== 'upgrade') {
      // Find or create "Chapa Payments" account
      let chapaAccount = await prisma.account.findFirst({
        where: { 
          name: 'Chapa Payments',
          companyName: req.user.companyName
        }
      });

      if (!chapaAccount) {
        chapaAccount = await prisma.account.create({
          data: {
            name: 'Chapa Payments',
            type: 'Revenue',
            balance: 0,
            companyName: req.user.companyName
          }
        });
      }

      // Create a pending transaction record
      const transaction = await prisma.transaction.create({
        data: {
          description: description || 'Chapa Payment',
          amount: parseFloat(amount),
          type: 'income',
          category: category || 'Sales',
          date: new Date(),
          reference: txRef,
          accountId: chapaAccount.id,
          createdBy: req.user.userId
        }
      });
    }

    // Create payment record
    await prisma.payment.create({
      data: {
        userId: req.user.userId,
        amount: parseFloat(amount),
        currency: 'ETB',
        txRef: txRef,
        status: 'pending',
        paymentMethod: 'Chapa',
        type: type,
        metadata: {
          description,
          category,
          type
        }
      }
    });

    // Check if we have real Chapa credentials
    if (CHAPA_SECRET_KEY && CHAPA_SECRET_KEY !== 'your_chapa_secret_key') {
      try {
        console.log('🔄 Initializing Chapa payment...');
        console.log('Secret Key (first 20 chars):', CHAPA_SECRET_KEY?.substring(0, 20) + '...');
        
        // Get user email from database for authenticated users
        let customerEmail = email;
        if (!customerEmail && req.user && req.user.userId) {
          const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: { email: true, firstName: true, lastName: true }
          });
          if (user) {
            customerEmail = user.email;
            if (!firstName) firstName = user.firstName;
            if (!lastName) lastName = user.lastName;
          }
        }
        
        // Fallback if still no email
        if (!customerEmail) {
          return res.status(400).json({ message: 'Email is required for payment' });
        }
        
        const customerFirstName = (firstName || 'Customer').trim() || 'Customer';
        const customerLastName = (lastName || 'User').trim() || 'User';
        const paymentAmount = parseFloat(amount);
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(customerEmail)) {
          console.error('Invalid email format:', customerEmail);
          return res.status(400).json({ message: 'Invalid email format: ' + customerEmail });
        }
        
        const requestBody = {
          amount: paymentAmount.toString(),
          currency: 'ETB',
          email: customerEmail,
          first_name: customerFirstName,
          last_name: customerLastName,
          tx_ref: txRef,
          callback_url: `${process.env.BACKEND_URL || process.env.FRONTEND_URL || 'http://localhost:5001'}/api/payments/webhook`,
          return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard?tab=finance&payment=success`
        };
        
        console.log('Request body:', JSON.stringify(requestBody, null, 2));
        
        // Real Chapa API call
        const chapaResponse = await fetch(`${CHAPA_BASE_URL}/transaction/initialize`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${CHAPA_SECRET_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });

        const chapaData = await chapaResponse.json();
        console.log('Chapa Response:', JSON.stringify(chapaData, null, 2));

        if (!chapaResponse.ok) {
          console.error('❌ Chapa API Error:', chapaData);
          // Return the actual error from Chapa
          return res.status(400).json({
            status: 'failed',
            message: chapaData.message || 'Chapa API request failed',
            error: chapaData
          });
        }

        if (chapaData.status === 'success' && chapaData.data?.checkout_url) {
          console.log('✅ Payment initialized successfully');
          return res.json({
            status: 'success',
            message: 'Payment initialized',
            data: {
              checkout_url: chapaData.data.checkout_url,
              tx_ref: txRef,
              transaction_id: transaction.id
            }
          });
        } else {
          console.error('❌ Unexpected Chapa response:', chapaData);
          return res.status(400).json({
            status: 'failed',
            message: chapaData.message || 'Payment initialization failed',
            error: chapaData
          });
        }
      } catch (chapaError) {
        console.error('❌ Chapa API Exception:', chapaError.message);
        return res.status(500).json({
          status: 'failed',
          message: 'Chapa API connection failed',
          error: chapaError.message
        });
      }
    }

    // Demo/Development mode - return mock URL
    const checkoutUrl = `https://checkout.chapa.co/checkout/payment/${txRef}`;
    
    res.json({
      status: 'success',
      message: 'Payment initialized (Demo Mode)',
      data: {
        checkout_url: checkoutUrl,
        tx_ref: txRef,
        transaction_id: transaction.id
      }
    });

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Payment Error:', error.message);
    }
    res.status(500).json({ 
      message: 'Payment initialization failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/* ============================
   VERIFY PAYMENT
============================ */

exports.verifyPayment = async (req, res) => {
  try {
    const { tx_ref } = req.params;

    if (!tx_ref) {
      return res.status(400).json({ message: 'Transaction reference is required' });
    }

    // Find payment record
    const payment = await prisma.payment.findUnique({
      where: { txRef: tx_ref }
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // If already successful, return current status
    if (payment.status === 'success') {
      return res.json({
        status: 'success',
        message: 'Payment already verified',
        data: payment
      });
    }

    // Check with Chapa API if we have real credentials
    if (CHAPA_SECRET_KEY && CHAPA_SECRET_KEY !== 'your_chapa_secret_key') {
      try {
        const verifyResponse = await fetch(`${CHAPA_BASE_URL}/transaction/verify/${tx_ref}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${CHAPA_SECRET_KEY}`
          }
        });

        if (verifyResponse.ok) {
          const verifyData = await verifyResponse.json();
          
          if (verifyData.status === 'success' && verifyData.data?.status === 'success') {
            // Update payment status
            await updatePaymentStatus(tx_ref, 'success', verifyData.data);
            
            return res.json({
              status: 'success',
              message: 'Payment verified successfully',
              data: verifyData.data
            });
          }
        }
      } catch (verifyError) {
        console.error('Chapa Verify Error:', verifyError);
      }
    }

    // Return current status
    res.json({
      status: payment.status,
      message: 'Payment status retrieved',
      data: payment
    });

  } catch (error) {
    console.error('Verify Payment Error:', error);
    res.status(500).json({ 
      message: 'Payment verification failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/* ============================
   WEBHOOK HANDLER
============================ */

exports.handleWebhook = async (req, res) => {
  try {
    const webhookData = req.body;
    
    // Verify webhook signature if configured
    const signature = req.headers['chapa-signature'];
    if (process.env.CHAPA_WEBHOOK_SECRET && signature) {
      const hash = crypto
        .createHmac('sha256', process.env.CHAPA_WEBHOOK_SECRET)
        .update(JSON.stringify(webhookData))
        .digest('hex');
      
      if (hash !== signature) {
        return res.status(401).json({ message: 'Invalid signature' });
      }
    }

    const { tx_ref, status, amount, currency } = webhookData;

    if (!tx_ref) {
      return res.status(400).json({ message: 'Transaction reference missing' });
    }

    // Update payment status
    await updatePaymentStatus(tx_ref, status, webhookData);

    res.json({ message: 'Webhook processed successfully' });

  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
};

/* ============================
   HELPER: UPDATE PAYMENT STATUS
============================ */

async function updatePaymentStatus(txRef, status, metadata = {}) {
  try {
    // Update payment record
    const payment = await prisma.payment.update({
      where: { txRef },
      data: {
        status,
        metadata: {
          ...metadata,
          updatedAt: new Date().toISOString()
        }
      }
    });

    // If payment successful, update the transaction and account balance
    if (status === 'success') {
      // Find the transaction
      const transaction = await prisma.transaction.findFirst({
        where: { reference: txRef },
        include: { account: true }
      });

      if (transaction) {
        // Update account balance
        await prisma.account.update({
          where: { id: transaction.accountId },
          data: {
            balance: {
              increment: transaction.amount
            }
          }
        });

        console.log(`✅ Payment ${txRef} verified - Account balance updated`);
      }
    }

    return payment;
  } catch (error) {
    console.error('Update Payment Status Error:', error);
    throw error;
  }
}

/* ============================
   SIMULATE PAYMENT (DEV ONLY)
============================ */

exports.simulatePayment = async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ message: 'Not available in production' });
  }

  try {
    const { tx_ref, status = 'success' } = req.body;

    if (!tx_ref) {
      return res.status(400).json({ message: 'Transaction reference required' });
    }

    await updatePaymentStatus(tx_ref, status, {
      simulated: true,
      simulatedAt: new Date().toISOString()
    });

    res.json({
      status: 'success',
      message: `Payment ${status} simulated successfully`
    });

  } catch (error) {
    console.error('Simulate Payment Error:', error);
    res.status(500).json({ message: 'Simulation failed' });
  }
};

/* ============================
   GET CHAPA CONFIG (PUBLIC KEY)
============================ */

exports.getChapaConfig = async (req, res) => {
  try {
    res.json({
      publicKey: CHAPA_PUBLIC_KEY || null,
      isTestMode,
      isConfigured: !!(CHAPA_SECRET_KEY && CHAPA_SECRET_KEY !== 'your_chapa_secret_key')
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get Chapa config' });
  }
};


/* ============================
   GET PAYMENT HISTORY
============================ */

exports.getPaymentHistory = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const payments = await prisma.payment.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    res.json(payments);
  } catch (error) {
    console.error('Get Payment History Error:', error);
    res.status(500).json({ message: 'Failed to fetch payment history' });
  }
};

/* ============================
   GET USER SUBSCRIPTION
============================ */

exports.getSubscription = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        plan: true,
        planExpiresAt: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate next billing date (1 month from now or plan expiry)
    const nextBillingDate = user.planExpiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    res.json({
      plan: user.plan || 'Starter',
      status: 'active',
      nextBillingDate,
      memberSince: user.createdAt
    });
  } catch (error) {
    console.error('Get Subscription Error:', error);
    res.status(500).json({ message: 'Failed to fetch subscription' });
  }
};
