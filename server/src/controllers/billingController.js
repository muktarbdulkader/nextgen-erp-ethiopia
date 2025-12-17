const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Plan pricing configuration
const PLANS = {
  Starter: {
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: ['Basic Invoicing', 'Up to 100 Invoices/month', 'Basic Reports', '1 User']
  },
  Growth: {
    monthlyPrice: 2500,
    yearlyPrice: 25000,
    features: ['Unlimited Invoices', 'Full AI Assistant', 'Chapa & Stripe Integration', '5 Users', 'Priority Support']
  },
  Enterprise: {
    monthlyPrice: 10000,
    yearlyPrice: 100000,
    features: ['Everything in Growth', 'Custom Integration', 'Dedicated Support', 'Unlimited Users', 'Advanced Analytics']
  }
};

/* ============================
   GET BILLING OVERVIEW
============================ */

exports.getBillingOverview = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        subscription: {
          include: {
            payments: {
              orderBy: { createdAt: 'desc' },
              take: 5
            },
            invoices: {
              orderBy: { createdAt: 'desc' },
              take: 5
            }
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentPlan = user.plan || 'Starter';
    const planDetails = PLANS[currentPlan] || PLANS.Starter;

    res.json({
      currentPlan,
      planDetails,
      subscription: user.subscription || null,
      availablePlans: Object.keys(PLANS).map(planName => ({
        name: planName,
        ...PLANS[planName]
      }))
    });
  } catch (error) {
    console.error('Get Billing Overview Error:', error);
    res.status(500).json({ message: 'Failed to fetch billing overview' });
  }
};

/* ============================
   UPGRADE PLAN
============================ */

exports.upgradePlan = async (req, res) => {
  try {
    const { newPlan, billingCycle = 'monthly' } = req.body;

    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!newPlan || !PLANS[newPlan]) {
      return res.status(400).json({ message: 'Invalid plan selected' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get pricing
    const amount = billingCycle === 'yearly' 
      ? PLANS[newPlan].yearlyPrice 
      : PLANS[newPlan].monthlyPrice;

    if (amount === 0) {
      // Free plan - no payment needed
      await prisma.user.update({
        where: { id: req.user.userId },
        data: { plan: newPlan }
      });

      // Create or update subscription
      const renewalDate = new Date();
      renewalDate.setMonth(renewalDate.getMonth() + (billingCycle === 'yearly' ? 12 : 1));

      await prisma.subscription.upsert({
        where: { userId: req.user.userId },
        create: {
          userId: req.user.userId,
          plan: newPlan,
          status: 'active',
          billingCycle,
          amount: 0,
          renewalDate
        },
        update: {
          plan: newPlan,
          status: 'active',
          billingCycle,
          amount: 0,
          renewalDate
        }
      });

      return res.json({
        status: 'success',
        message: `Upgraded to ${newPlan} plan`,
        plan: newPlan
      });
    }

    // Paid plan - return upgrade info for payment
    res.json({
      status: 'payment_required',
      message: 'Payment required to upgrade',
      data: {
        plan: newPlan,
        amount,
        billingCycle,
        currency: 'ETB',
        description: `${newPlan} Plan - ${billingCycle === 'yearly' ? 'Annual' : 'Monthly'} Subscription`
      }
    });
  } catch (error) {
    console.error('Upgrade Plan Error:', error);
    res.status(500).json({ message: 'Failed to upgrade plan' });
  }
};

/* ============================
   CONFIRM UPGRADE (After Payment)
============================ */

exports.confirmUpgrade = async (req, res) => {
  try {
    const { newPlan, billingCycle = 'monthly', txRef } = req.body;

    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!newPlan || !PLANS[newPlan]) {
      return res.status(400).json({ message: 'Invalid plan' });
    }

    // Verify payment was successful
    const payment = await prisma.payment.findUnique({
      where: { txRef }
    });

    if (!payment || payment.status !== 'success') {
      return res.status(400).json({ message: 'Payment not verified' });
    }

    // Update user plan
    await prisma.user.update({
      where: { id: req.user.userId },
      data: { plan: newPlan }
    });

    // Create or update subscription
    const renewalDate = new Date();
    renewalDate.setMonth(renewalDate.getMonth() + (billingCycle === 'yearly' ? 12 : 1));

    const amount = billingCycle === 'yearly' 
      ? PLANS[newPlan].yearlyPrice 
      : PLANS[newPlan].monthlyPrice;

    const subscription = await prisma.subscription.upsert({
      where: { userId: req.user.userId },
      create: {
        userId: req.user.userId,
        plan: newPlan,
        status: 'active',
        billingCycle,
        amount,
        renewalDate,
        paymentMethod: payment.paymentMethod
      },
      update: {
        plan: newPlan,
        status: 'active',
        billingCycle,
        amount,
        renewalDate,
        paymentMethod: payment.paymentMethod
      }
    });

    // Link payment to subscription
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        subscriptionId: subscription.id,
        type: 'subscription'
      }
    });

    // Create invoice
    const invoiceNumber = `INV-${Date.now()}`;
    const tax = amount * 0.15; // 15% VAT
    const total = amount + tax;

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    await prisma.invoice.create({
      data: {
        subscriptionId: subscription.id,
        invoiceNumber,
        amount,
        tax,
        total,
        status: 'paid',
        paidDate: new Date(),
        dueDate,
        description: `${newPlan} Plan - ${billingCycle === 'yearly' ? 'Annual' : 'Monthly'} Subscription`
      }
    });

    res.json({
      status: 'success',
      message: `Successfully upgraded to ${newPlan} plan`,
      plan: newPlan,
      subscription
    });
  } catch (error) {
    console.error('Confirm Upgrade Error:', error);
    res.status(500).json({ message: 'Failed to confirm upgrade' });
  }
};

/* ============================
   GET INVOICES
============================ */

exports.getInvoices = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user.userId }
    });

    if (!subscription) {
      return res.json([]);
    }

    const invoices = await prisma.invoice.findMany({
      where: { subscriptionId: subscription.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json(invoices);
  } catch (error) {
    console.error('Get Invoices Error:', error);
    res.status(500).json({ message: 'Failed to fetch invoices' });
  }
};

/* ============================
   GET SUBSCRIPTION
============================ */

exports.getSubscription = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user.userId },
      include: {
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        invoices: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!subscription) {
      return res.json(null);
    }

    res.json(subscription);
  } catch (error) {
    console.error('Get Subscription Error:', error);
    res.status(500).json({ message: 'Failed to fetch subscription' });
  }
};

/* ============================
   CANCEL SUBSCRIPTION
============================ */

exports.cancelSubscription = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user.userId }
    });

    if (!subscription) {
      return res.status(404).json({ message: 'No active subscription' });
    }

    // Cancel subscription
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'cancelled',
        cancelledAt: new Date(),
        autoRenew: false
      }
    });

    // Downgrade user to Starter plan
    await prisma.user.update({
      where: { id: req.user.userId },
      data: { plan: 'Starter' }
    });

    res.json({
      status: 'success',
      message: 'Subscription cancelled. You have been downgraded to Starter plan.'
    });
  } catch (error) {
    console.error('Cancel Subscription Error:', error);
    res.status(500).json({ message: 'Failed to cancel subscription' });
  }
};

/* ============================
   UPDATE PAYMENT METHOD
============================ */

exports.updatePaymentMethod = async (req, res) => {
  try {
    const { paymentMethod } = req.body;

    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!['telebirr', 'cbe', 'card'].includes(paymentMethod)) {
      return res.status(400).json({ message: 'Invalid payment method' });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user.userId }
    });

    if (!subscription) {
      return res.status(404).json({ message: 'No active subscription' });
    }

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { paymentMethod }
    });

    res.json({
      status: 'success',
      message: 'Payment method updated',
      paymentMethod
    });
  } catch (error) {
    console.error('Update Payment Method Error:', error);
    res.status(500).json({ message: 'Failed to update payment method' });
  }
};

/* ============================
   GET BILLING HISTORY
============================ */

exports.getBillingHistory = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user.userId }
    });

    if (!subscription) {
      return res.json({ payments: [], invoices: [] });
    }

    const [payments, invoices] = await Promise.all([
      prisma.payment.findMany({
        where: { subscriptionId: subscription.id },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.invoice.findMany({
        where: { subscriptionId: subscription.id },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    res.json({ payments, invoices });
  } catch (error) {
    console.error('Get Billing History Error:', error);
    res.status(500).json({ message: 'Failed to fetch billing history' });
  }
};
