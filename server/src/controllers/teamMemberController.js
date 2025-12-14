const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Default roles with permissions
const DEFAULT_ROLES = [
  { name: 'Admin', permissions: ['Full Access', 'User Management', 'Settings', 'Billing'], isDefault: true },
  { name: 'Manager', permissions: ['View Reports', 'Manage Team', 'Edit Data', 'Approve Requests'], isDefault: true },
  { name: 'User', permissions: ['View Data', 'Create Records', 'Edit Own Records'], isDefault: true },
  { name: 'Viewer', permissions: ['View Data Only'], isDefault: true }
];

// Initialize default roles for a company
async function initializeRoles(companyName) {
  const existingRoles = await prisma.role.findMany({ where: { companyName } });
  
  if (existingRoles.length === 0) {
    await prisma.role.createMany({
      data: DEFAULT_ROLES.map(role => ({
        ...role,
        companyName
      }))
    });
  }
}

// Get all team members for company
exports.getTeamMembers = async (req, res) => {
  try {
    const { companyName } = req.user;
    
    const members = await prisma.teamMember.findMany({
      where: { companyName },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(members);
  } catch (error) {
    console.error('Get team members error:', error);
    res.status(500).json({ error: 'Failed to fetch team members' });
  }
};

// Invite new team member
exports.inviteTeamMember = async (req, res) => {
  try {
    const { companyName, userId } = req.user;
    const { email, name, role } = req.body;
    
    // Check if already exists
    const existing = await prisma.teamMember.findUnique({
      where: { email_companyName: { email, companyName } }
    });
    
    if (existing) {
      return res.status(400).json({ error: 'Team member already exists' });
    }
    
    // Get role permissions from database
    const roleData = await prisma.role.findUnique({
      where: { name_companyName: { name: role || 'User', companyName } }
    });
    
    const member = await prisma.teamMember.create({
      data: {
        email,
        name,
        role: role || 'User',
        status: 'Pending',
        invitedBy: userId,
        companyName,
        permissions: roleData ? { permissions: roleData.permissions } : null
      }
    });
    
    // TODO: Send invitation email
    
    res.status(201).json(member);
  } catch (error) {
    console.error('Invite team member error:', error);
    res.status(500).json({ error: 'Failed to invite team member' });
  }
};

// Update team member
exports.updateTeamMember = async (req, res) => {
  try {
    const { companyName } = req.user;
    const { id } = req.params;
    const { role, status, permissions } = req.body;
    
    const member = await prisma.teamMember.findFirst({
      where: { id, companyName }
    });
    
    if (!member) {
      return res.status(404).json({ error: 'Team member not found' });
    }
    
    // If role is being updated, get new role permissions
    let newPermissions = permissions;
    if (role && role !== member.role) {
      const roleData = await prisma.role.findUnique({
        where: { name_companyName: { name: role, companyName } }
      });
      if (roleData) {
        newPermissions = { permissions: roleData.permissions };
      }
    }
    
    const updated = await prisma.teamMember.update({
      where: { id },
      data: {
        ...(role && { role }),
        ...(status && { status }),
        ...(newPermissions && { permissions: newPermissions })
      }
    });
    
    res.json(updated);
  } catch (error) {
    console.error('Update team member error:', error);
    res.status(500).json({ error: 'Failed to update team member' });
  }
};

// Remove team member
exports.removeTeamMember = async (req, res) => {
  try {
    const { companyName } = req.user;
    const { id } = req.params;
    
    const member = await prisma.teamMember.findFirst({
      where: { id, companyName }
    });
    
    if (!member) {
      return res.status(404).json({ error: 'Team member not found' });
    }
    
    await prisma.teamMember.delete({ where: { id } });
    
    res.json({ message: 'Team member removed successfully' });
  } catch (error) {
    console.error('Remove team member error:', error);
    res.status(500).json({ error: 'Failed to remove team member' });
  }
};

// Get all roles for company (from database)
exports.getRoles = async (req, res) => {
  try {
    const { companyName } = req.user;
    
    // Initialize default roles if none exist
    await initializeRoles(companyName);
    
    const roles = await prisma.role.findMany({
      where: { companyName },
      orderBy: { name: 'asc' }
    });
    
    // Format for frontend
    const formattedRoles = roles.map(r => ({
      id: r.id,
      role: r.name,
      description: r.description,
      permissions: r.permissions,
      isDefault: r.isDefault
    }));
    
    res.json(formattedRoles);
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
};

// Create new role
exports.createRole = async (req, res) => {
  try {
    const { companyName } = req.user;
    const { name, description, permissions } = req.body;
    
    if (!name || !permissions || permissions.length === 0) {
      return res.status(400).json({ error: 'Name and permissions are required' });
    }
    
    // Check if role already exists
    const existing = await prisma.role.findUnique({
      where: { name_companyName: { name, companyName } }
    });
    
    if (existing) {
      return res.status(400).json({ error: 'Role already exists' });
    }
    
    const role = await prisma.role.create({
      data: {
        name,
        description,
        permissions,
        companyName,
        isDefault: false
      }
    });
    
    res.status(201).json({
      id: role.id,
      role: role.name,
      description: role.description,
      permissions: role.permissions,
      isDefault: role.isDefault
    });
  } catch (error) {
    console.error('Create role error:', error);
    res.status(500).json({ error: 'Failed to create role' });
  }
};

// Update role
exports.updateRole = async (req, res) => {
  try {
    const { companyName } = req.user;
    const { id } = req.params;
    const { name, description, permissions } = req.body;
    
    const role = await prisma.role.findFirst({
      where: { id, companyName }
    });
    
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }
    
    const updated = await prisma.role.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(permissions && { permissions })
      }
    });
    
    res.json({
      id: updated.id,
      role: updated.name,
      description: updated.description,
      permissions: updated.permissions,
      isDefault: updated.isDefault
    });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ error: 'Failed to update role' });
  }
};

// Delete role
exports.deleteRole = async (req, res) => {
  try {
    const { companyName } = req.user;
    const { id } = req.params;
    
    const role = await prisma.role.findFirst({
      where: { id, companyName }
    });
    
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }
    
    if (role.isDefault) {
      return res.status(400).json({ error: 'Cannot delete default roles' });
    }
    
    // Check if any team members use this role
    const membersWithRole = await prisma.teamMember.count({
      where: { companyName, role: role.name }
    });
    
    if (membersWithRole > 0) {
      return res.status(400).json({ error: `Cannot delete role. ${membersWithRole} team member(s) are using it.` });
    }
    
    await prisma.role.delete({ where: { id } });
    
    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    console.error('Delete role error:', error);
    res.status(500).json({ error: 'Failed to delete role' });
  }
};

// Legacy endpoint for backward compatibility
exports.getRolePermissions = exports.getRoles;
