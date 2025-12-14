const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all campaigns
exports.getCampaigns = async (req, res) => {
  try {
    const { companyName } = req.user;

    const campaigns = await prisma.campaign.findMany({
      where: { companyName },
      orderBy: { createdAt: 'desc' }
    });

    res.json(campaigns);
  } catch (error) {
    console.error('Get Campaigns Error:', error);
    res.status(500).json({ message: 'Error fetching campaigns' });
  }
};

// Create campaign
exports.createCampaign = async (req, res) => {
  try {
    const { companyName, userId } = req.user;
    const { name, type, scheduledDate } = req.body;

    const campaign = await prisma.campaign.create({
      data: {
        name,
        type: type || 'Email',
        status: 'Draft',
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        companyName,
        userId
      }
    });

    res.status(201).json(campaign);
  } catch (error) {
    console.error('Create Campaign Error:', error);
    res.status(500).json({ message: 'Error creating campaign' });
  }
};

// Update campaign
exports.updateCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const { companyName } = req.user;
    const data = req.body;

    const campaign = await prisma.campaign.updateMany({
      where: { id, companyName },
      data
    });

    res.json({ message: 'Campaign updated successfully', campaign });
  } catch (error) {
    console.error('Update Campaign Error:', error);
    res.status(500).json({ message: 'Error updating campaign' });
  }
};

// Get marketing stats
exports.getStats = async (req, res) => {
  try {
    const { companyName } = req.user;

    const campaigns = await prisma.campaign.findMany({ where: { companyName } });
    
    const totalCampaigns = campaigns.length;
    const totalSent = campaigns.reduce((sum, c) => sum + c.sent, 0);
    const totalOpened = campaigns.reduce((sum, c) => sum + c.opened, 0);
    const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);
    const openRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0;

    res.json({
      totalCampaigns,
      totalSent,
      openRate,
      totalConversions
    });
  } catch (error) {
    console.error('Get Marketing Stats Error:', error);
    res.status(500).json({ message: 'Error fetching marketing stats' });
  }
};
