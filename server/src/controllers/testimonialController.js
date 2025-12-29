const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get random predefined testimonials (no real user data for privacy)
exports.getTestimonials = async (req, res) => {
  try {
    const testimonials = [
      {
        initial: 'DK',
        name: 'Dawit Kebede',
        title: 'CEO, Horizon Coffee PLC',
        message: 'muktiAp transformed how we manage our coffee exports. The AI insights alone saved us thousands in inventory costs.'
      },
      {
        initial: 'SA',
        name: 'Sara Alemu',
        title: 'Operations Manager, Addis Textiles',
        message: 'The best ERP solution for Ethiopian businesses. Our team productivity increased by 40% after switching to muktiAp.'
      },
      {
        initial: 'TG',
        name: 'Tadesse Girma',
        title: 'Founder, Girma Construction',
        message: 'Managing inventory and finances has never been easier. muktiAp is a game changer for construction companies.'
      },
      {
        initial: 'HB',
        name: 'Hana Bekele',
        title: 'CFO, Ethiopian Logistics',
        message: 'Finally, an ERP system that understands Ethiopian business needs. Highly recommended!'
      },
      {
        initial: 'KM',
        name: 'Kassahun Mengistu',
        title: 'Director, Mengistu Farming',
        message: 'The AI-powered insights helped us optimize our entire supply chain. Incredible ROI.'
      }
    ];

    // Return a random testimonial
    const randomTestimonial = testimonials[Math.floor(Math.random() * testimonials.length)];
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
