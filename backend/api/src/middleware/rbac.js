import { OrganizationMember, Role } from '@n8n-clone/shared';

export function requirePermission(resource, action) {
  return async (req, res, next) => {
    try {
      const { organizationId } = req.params;
      const userId = req.userId;

      if (req.user?.isSuperAdmin) {
        return next();
      }

      if (!organizationId) {
        return res.status(400).json({ error: 'Organization ID required' });
      }

      const membership = await OrganizationMember.findOne({
        organizationId,
        userId,
        status: 'active',
        deletedAt: null
      }).populate('roleId');

      if (!membership) {
        return res.status(403).json({ error: 'Not a member of this organization' });
      }

      const role = membership.roleId;
      const permission = role.permissions.find(p => p.resource === resource);

      if (!permission || !permission.actions.includes(action)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      req.organizationId = organizationId;
      req.membership = membership;
      next();
    } catch (error) {
      return res.status(500).json({ error: 'Authorization check failed' });
    }
  };
}

export async function requireOrgAccess(req, res, next) {
  try {
    const { organizationId } = req.params;
    const userId = req.userId;

    if (req.user?.isSuperAdmin) {
      return next();
    }

    const membership = await OrganizationMember.findOne({
      organizationId,
      userId,
      status: 'active',
      deletedAt: null
    });

    if (!membership) {
      return res.status(403).json({ error: 'Not a member of this organization' });
    }

    req.organizationId = organizationId;
    req.membership = membership;
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Access check failed' });
  }
}
