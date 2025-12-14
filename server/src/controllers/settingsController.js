const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get module settings for a company
exports.getModuleSettings = async (req, res) => {
  try {
    const { companyName } = req.user;

    let settings = await prisma.moduleSettings.findUnique({
      where: { companyName }
    });

    // If no settings exist, create default settings
    if (!settings) {
      const defaultModules = [
        'crm',
        'sales',
        'procurement',
        'inventory',
        'accounting',
        'expenses',
        'hr'
      ];

      settings = await prisma.moduleSettings.create({
        data: {
          companyName,
          enabledModules: defaultModules
        }
      });
    }

    res.json(settings);
  } catch (error) {
    console.error('Get Module Settings Error:', error);
    res.status(500).json({ message: 'Error fetching module settings' });
  }
};

// Update module settings
exports.updateModuleSettings = async (req, res) => {
  try {
    const { companyName } = req.user;
    const { enabledModules } = req.body;

    if (!Array.isArray(enabledModules)) {
      return res.status(400).json({ message: 'enabledModules must be an array' });
    }

    const settings = await prisma.moduleSettings.upsert({
      where: { companyName },
      update: {
        enabledModules,
        updatedAt: new Date()
      },
      create: {
        companyName,
        enabledModules
      }
    });

    res.json({ 
      message: 'Module settings saved successfully',
      settings 
    });
  } catch (error) {
    console.error('Update Module Settings Error:', error);
    res.status(500).json({ message: 'Error updating module settings' });
  }
};

// Toggle a single module
exports.toggleModule = async (req, res) => {
  try {
    const { companyName } = req.user;
    const { moduleId } = req.body;

    if (!moduleId) {
      return res.status(400).json({ message: 'moduleId is required' });
    }

    // Get current settings
    let settings = await prisma.moduleSettings.findUnique({
      where: { companyName }
    });

    if (!settings) {
      // Create with this module enabled
      settings = await prisma.moduleSettings.create({
        data: {
          companyName,
          enabledModules: [moduleId]
        }
      });
    } else {
      // Toggle the module
      let enabledModules = settings.enabledModules;
      
      if (enabledModules.includes(moduleId)) {
        // Remove it
        enabledModules = enabledModules.filter(id => id !== moduleId);
      } else {
        // Add it
        enabledModules = [...enabledModules, moduleId];
      }

      settings = await prisma.moduleSettings.update({
        where: { companyName },
        data: { enabledModules }
      });
    }

    res.json({ 
      message: 'Module toggled successfully',
      settings 
    });
  } catch (error) {
    console.error('Toggle Module Error:', error);
    res.status(500).json({ message: 'Error toggling module' });
  }
};
