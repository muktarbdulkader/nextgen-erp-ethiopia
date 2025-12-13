const { PrismaClient } = require('@prisma/client');
const { sendEmail } = require('../utils/email');
const prisma = new PrismaClient();

exports.submitRequest = async (req, res) => {
  try {
    const { name, company, email, type, message } = req.body;

    const request = await prisma.partnerRequest.create({
      data: { name, company, email, type, message }
    });

    // Send confirmation email to the partner
    await sendEmail({
        to: email,
        subject: 'MuktiAp Partnership Request Received',
        html: `
            <h3>Selam ${name},</h3>
            <p>Thank you for your interest in partnering with MuktiAp as a <strong>${type}</strong>.</p>
            <p>We have received your details for <strong>${company}</strong> and our team will review your application within 24 hours.</p>
            <br/>
            <p>Best Regards,<br/>The MuktiAp Team</p>
        `
    });

    // Notify Admin (You)
    await sendEmail({
        to: process.env.SMTP_USER || 'admin@muktiap.com',
        subject: `New Partner Lead: ${company}`,
        html: `
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Company:</strong> ${company}</p>
            <p><strong>Type:</strong> ${type}</p>
            <p><strong>Message:</strong> ${message}</p>
        `
    });

    res.status(201).json({ message: 'Request submitted successfully' });
  } catch (error) {
    console.error('Partner Submit Error:', error);
    res.status(500).json({ message: 'Error processing request' });
  }
};
