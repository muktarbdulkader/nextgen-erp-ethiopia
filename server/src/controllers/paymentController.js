const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient();

const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY;
const CHAPA_BASE_URL = process.env.CHAPA_BASE_URL || 'https://api.chapa.co/v1';

/* ============================
   INITIALIZE PAYMENT
============================ */

exports.initializePayment = async (req, res) => {
  try {
    const { amount, email, firstName, lastName, description, category } = req.body;
    
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }

    // Generate unique transaction reference
    const txRef = `MUKTI-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

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

    // Create payment record
    await prisma.payment.create({
      data: {
        userId: req.user.userId,
        amount: parseFloat(amount),
        currency: 'ETB',
        txRef: txRef,
        status: 'pending',
        paymentMethod: 'Chapa',
        metadata: {
          description,
          category,
          transactionId: transaction.id
        }
      }
    });

    // Check if we have real Chapa credentials
    if (CHAPA_SECRET_KEY && CHAPA_SECRET_KEY !== 'your_chapa_secret_key') {
      try {
        // Real Chapa API call
        const chapaResponse = await fetch(`${CHAPA_BASE_URL}/transaction/initialize`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${CHAPA_SECRET_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            amount: amount.toString(),
            currency: 'ETB',
            email: email || req.user.email || 'customer@example.com',
            first_name: firstName || 'Customer',
            last_name: lastName || 'User',
            tx_ref: txRef,
            callback_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/callback`,
            return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard?tab=finance`,
            customization: {
              title: 'MuktiAp Payment',
              description: description || 'Payment for services'
            }
          })
        });

        if (!chapaResponse.ok) {
          throw new Error('Chapa API request failed');
        }

        const chapaData = await chapaResponse.json();

        if (chapaData.status === 'success' && chapaData.data?.checkout_url) {
          return res.json({
            status: 'success',
            message: 'Payment initialized',
            data: {
              checkout_url: chapaData.data.checkout_url,
              tx_ref: txRef,
              transaction_id: transaction.id
            }
          });
        }
      } catch (chapaError) {
        console.error('Chapa API Error:', chapaError);
        // Fall through to demo mode
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