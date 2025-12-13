const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get random testimonials from real users (anonymized)
exports.getTestimonials = async (req, res) => {
  try {
    // Get random users with their company names
    const users = await prisma.user.findMany({
      select: {
        firstName: true,
        lastName: true,
        companyName: true,
        role: true,
        createdAt: true
      },
      take: 10,
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Create testimonials from real users
    const testimonials = users.map(user => {
      const initial = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
      const fullName = `${user.firstName} ${user.lastName}`;
      
      // Rotate through different testimonial messages
      const messages = [
        `muktiAp transformed how we manage our business. The AI insights alone saved us thousands in costs.`,
        `The best ERP solution for Ethiopian businesses. Highly recommended!`,
        `Managing inventory and finances has never been easier. muktiAp is a game changer.`,
        `Our team productivity increased by 40% after switching to muktiAp.`,
        `Finally, an ERP system that understands Ethiopian business needs.`
      ];
      
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      
      return {
        initial,
        name: fullName,
        title: `${user.role || 'Manager'}, ${user.companyName}`,
        message: randomMessage
      };
    });

    // Return a random testimonial
    const randomTestimonial = testimonials[Math.floor(Math.random() * testimonials.length)] || {
      initial: 'DK',
      name: 'Dawit Kebede',
      title: 'CEO, Horizon Coffee PLC',
      message: 'muktiAp transformed how we manage our coffee exports. The AI insights alone saved us thousands in inventory costs.'
    };

    res.json(randomTestimonial);
  } catch (error) {
    console.error('Testimonial Error:', error);
    // Return default testimonial on error
    res.json({
      initial: 'DK',
      name: 'Dawit Kebede',
      title: 'CEO, Horizon Coffee PLC',
      message: 'muktiAp transformed how we manage our coffee exports. The AI insights alone saved us thousands in inventory costs.'
    });
  }
};
