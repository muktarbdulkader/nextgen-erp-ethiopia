const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get notification settings
exports.getSettings = async (req, res) => {
  try {
    const { userId } = req.user;

    let settings = await prisma.notificationSettings.findUnique({
      where: { userId }
    });

    if (!settings) {
      // Create default settings
      const defaultEmailNotifications = {
        newOrders: true,
        lowStock: true,
        paymentReceived: true,
        taskAssignments: false,
        weeklyReports: true
      };

      const defaultInAppNotifications = {
        desktopNotifications: true,
        soundAlerts: false,
        badgeCounter: true
      };

      settings = await prisma.notificationSettings.create({
        data: {
          userId,
          emailNotifications: defaultEmailNotifications,
          inAppNotifications: defaultInAppNotifications
        }
      });
    }

    res.json(settings);
  } catch (error) {
    console.error('Get Notification Settings Error:', error);
    res.status(500).json({ message: 'Error fetching notification settings' });
  }
};

// Update notification settings
exports.updateSettings = async (req, res) => {
  try {
    const { userId } = req.user;
    const { emailNotifications, inAppNotifications } = req.body;

    const settings = await prisma.notificationSettings.upsert({
      where: { userId },
      update: {
        emailNotifications,
        inAppNotifications
      },
      create: {
        userId,
        emailNotifications,
        inAppNotifications
      }
    });

    res.json({ message: 'Notification settings updated successfully', settings });
  } catch (error) {
    console.error('Update Notification Settings Error:', error);
    res.status(500).json({ message: 'Error updating notification settings' });
  }
};
