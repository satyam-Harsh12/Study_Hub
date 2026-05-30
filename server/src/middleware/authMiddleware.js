import { verifyToken } from '../utils/jwt.js';
import { User } from '../models/User.js';
import '../models/Role.js'; // Ensure Role model is registered
import '../models/Permission.js'; // Ensure Permission model is registered

export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, token missing' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id)
      .select('-password')
      .populate({
        path: 'role',
        populate: {
          path: 'permissions'
        }
      });
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: 'User is deactivated' });
    }
    req.user = user;
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// This function checks for permissions or specific role names.
// It populates the user's role and permissions in the protect middleware.
export const authorizeRoles = (...requiredRolesOrPermissions) => (req, res, next) => {
  const user = req.user;

  if (!user || !user.role) {
    return res.status(403).json({ message: 'Access denied: No role assigned' });
  }

  // Super Admin has all permissions
  if (user.role.name === 'super_admin') {
    return next();
  }

  // Check if user has one of the required roles (direct string match on role name)
  const userRoleName = user.role.name;
  if (requiredRolesOrPermissions.includes(userRoleName)) {
    return next();
  }

  // Check if role has required permissions
  // We assume if the argument contains a dot, it is a permission, otherwise it might be a role name
  // But strict check: if the requirement is a permission string
  const userPermissions = user.role.permissions ? user.role.permissions.map(p => p.name) : [];

  // Logic: if ANY of the required items is matched (OR logic) or ALL (AND logic)? 
  // Usually, middleware like `authorize('admin', 'instructor')` means EITHER admin OR instructor.
  // But `authorize('course.create', 'course.edit')` might mean BOTH?
  // Let's adopt OR logic for roles, and maintain existing AND logic for permission arrays if specific?
  // Current usage in adminRoutes is `authorizeRoles('course.edit')` (single string).

  // Let's support mixed. If any of the required strings match a role name OR a permission, allow.
  const hasAccess = requiredRolesOrPermissions.some(req => {
    return req === userRoleName || userPermissions.includes(req);
  });

  if (!hasAccess) {
    return res.status(403).json({ message: 'Insufficient permissions' });
  }

  return next();
};


