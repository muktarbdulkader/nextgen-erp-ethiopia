/**
 * Permission middleware - checks if user has required permission
 * Usage: router.get('/admin-only', checkPermission('User Management'), controller)
 */
const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    const { permissions, role } = req.user;

    // Admin with Full Access can do anything
    if (role === 'Admin' || (permissions && permissions.includes('Full Access'))) {
      return next();
    }

    // Check if user has the required permission
    if (permissions && permissions.includes(requiredPermission)) {
      return next();
    }

    return res.status(403).json({ 
      message: 'Access denied',
      hint: `You need "${requiredPermission}" permission to perform this action`
    });
  };
};

/**
 * Check if user is Admin
 */
const isAdmin = (req, res, next) => {
  const { role, permissions } = req.user;

  if (role === 'Admin' || (permissions && permissions.includes('Full Access'))) {
    return next();
  }

  return res.status(403).json({ 
    message: 'Admin access required',
    hint: 'Only administrators can perform this action'
  });
};

/**
 * Check multiple permissions (user needs at least one)
 */
const checkAnyPermission = (requiredPermissions) => {
  return (req, res, next) => {
    const { permissions, role } = req.user;

    if (role === 'Admin' || (permissions && permissions.includes('Full Access'))) {
      return next();
    }

    const hasPermission = requiredPermissions.some(perm => 
      permissions && permissions.includes(perm)
    );

    if (hasPermission) {
      return next();
    }

    return res.status(403).json({ 
      message: 'Access denied',
      hint: `You need one of these permissions: ${requiredPermissions.join(', ')}`
    });
  };
};

module.exports = { checkPermission, isAdmin, checkAnyPermission };
