const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all leads
exports.getLeads = async (req, res) => {
  try {
    const { companyName } = req.user;

    const leads = await prisma.lead.findMany({
      where: { companyName },
      orderBy: { createdAt: 'desc' }
    });

    res.json(leads);
  } catch (error) {
    console.error('Get Leads Error:', error);
    res.status(500).json({ message: 'Error fetching leads' });
  }
};

// Create lead
exports.createLead = async (req, res) => {
  try {
    const { companyName, userId } = req.user;
    const { name, company, email, phone, status, value, source, notes } = req.body;

    const lead = await prisma.lead.create({
      data: {
        name,
        company,
        email,
        phone,
        status: status || 'Cold',
        value,
        source,
        notes,
        companyName,
        userId
      }
    });

    res.status(201).json(lead);
  } catch (error) {
    console.error('Create Lead Error:', error);
    res.status(500).json({ message: 'Error creating lead' });
  }
};

// Update lead
exports.updateLead = async (req, res) => {
  try {
    const { id } = req.params;
    const { companyName } = req.user;
    const data = req.body;

    const lead = await prisma.lead.updateMany({
      where: { id, companyName },
      data
    });

    res.json({ message: 'Lead updated successfully', lead });
  } catch (error) {
    console.error('Update Lead Error:', error);
    res.status(500).json({ message: 'Error updating lead' });
  }
};

// Delete lead
exports.deleteLead = async (req, res) => {
  try {
    const { id } = req.params;
    const { companyName } = req.user;

    await prisma.lead.deleteMany({
      where: { id, companyName }
    });

    res.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    console.error('Delete Lead Error:', error);
    res.status(500).json({ message: 'Error deleting lead' });
  }
};

// Get CRM stats
exports.getStats = async (req, res) => {
  try {
    const { companyName } = req.user;

    const totalLeads = await prisma.lead.count({ where: { companyName } });
    const hotLeads = await prisma.lead.count({ where: { companyName, status: 'Hot' } });
    
    const leads = await prisma.lead.findMany({ where: { companyName } });
    const pipelineValue = leads.reduce((sum, lead) => sum + (lead.value || 0), 0);

    res.json({
      totalLeads,
      hotLeads,
      conversions: Math.floor(totalLeads * 0.073),
      pipelineValue
    });
  } catch (error) {
    console.error('Get CRM Stats Error:', error);
    res.status(500).json({ message: 'Error fetching CRM stats' });
  }
};
