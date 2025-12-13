const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getNotifications = async (req, res) => {
  try {
    // Auto-generate some mock notifications if empty for demo purposes
    const count = await prisma.notification.count({ where: { userId: req.user.userId } });
    
    if (count === 0) {
        await prisma.notification.createMany({
            data: [
                {
                    title: 'Welcome to MuktiAp',
                    message: 'Your account has been successfully set up.',
                    type: 'success',
                    userId: req.user.userId
                },
                {
                    title: 'Complete Profile',
                    message: 'Please update your company tax information.',
                    type: 'info',
                    userId: req.user.userId
                }
            ]
        });
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications' });
  }
};

exports.markRead = async (req, res) => {
  try {
    await prisma.notification.updateMany({
        where: { userId: req.user.userId, read: false },
        data: { read: true }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error updating notifications' });
  }
};
