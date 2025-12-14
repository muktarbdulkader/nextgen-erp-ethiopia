const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get organization settings
exports.getSettings = async (req, res) => {
  try {
    const { companyName, displayCompanyName } = req.user;

    let settings = await prisma.organizationSettings.findUnique({
      where: { companyName }
    });

    if (!settings) {
      // Create default settings with companyName pre-filled
      settings = await prisma.organizationSettings.create({
        data: { 
          companyName,
          currency: 'ETB',
          timezone: 'Africa/Addis_Ababa',
          dateFormat: 'DD/MM/YYYY',
          vatRate: 15,
          withholdingTax: 2
        }
      });
    }

    // Return displayCompanyName for UI display (the actual company name user entered)
    // companyName is the email used for data isolation
    res.json({ 
      ...settings, 
      companyName: displayCompanyName || companyName // Show display name in UI
    });
  } catch (error) {
    console.error('Get Organization Settings Error:', error);
    res.status(500).json({ message: 'Error fetching organization settings' });
  }
};

// Update organization settings
exports.updateSettings = async (req, res) => {
  try {
    const { companyName } = req.user;
    const data = req.body;

    const settings = await prisma.organizationSettings.upsert({
      where: { companyName },
      update: data,
      create: { companyName, ...data }
    });

    res.json({ message: 'Settings updated successfully', settings });
  } catch (error) {
    console.error('Update Organization Settings Error:', error);
    res.status(500).json({ message: 'Error updating organization settings' });
  }
};
