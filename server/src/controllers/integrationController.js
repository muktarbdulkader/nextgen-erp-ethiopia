const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all integrations
exports.getIntegrations = async (req, res) => {
  try {
    const { companyName } = req.user;

    const integrations = await prisma.integration.findMany({
      where: { companyName }
    });

    res.json(integrations);
  } catch (error) {
    console.error('Get Integrations Error:', error);
    res.status(500).json({ message: 'Error fetching integrations' });
  }
};

// Connect integration
exports.connectIntegration = async (req, res) => {
  try {
    const { companyName } = req.user;
    const { name, apiKey, config } = req.body;

    const integration = await prisma.integration.upsert({
      where: {
        companyName_name: {
          companyName,
          name
        }
      },
      update: {
        status: 'connected',
        apiKey,
        config
      },
      create: {
        companyName,
        name,
        status: 'connected',
        apiKey,
        config
      }
    });

    res.json({ message: 'Integration connected successfully', integration });
  } catch (error) {
    console.error('Connect Integration Error:', error);
    res.status(500).json({ message: 'Error connecting integration' });
  }
};

// Disconnect integration
exports.disconnectIntegration = async (req, res) => {
  try {
    const { companyName } = req.user;
    const { name } = req.params;

    await prisma.integration.updateMany({
      where: { companyName, name },
      data: { 
        status: 'disconnected',
        apiKey: null
      }
    });

    res.json({ message: 'Integration disconnected successfully' });
  } catch (error) {
    console.error('Disconnect Integration Error:', error);
    res.status(500).json({ message: 'Error disconnecting integration' });
  }
};
