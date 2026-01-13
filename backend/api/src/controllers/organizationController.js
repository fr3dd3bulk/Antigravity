import { Organization, OrganizationMember, Role } from '@n8n-clone/shared';

export async function createOrganization(req, res) {
  try {
    const { name, description } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const organization = await Organization.create({
      name,
      slug,
      description,
      ownerId: req.userId
    });

    const ownerRole = await Role.create({
      name: 'Owner',
      slug: 'owner',
      organizationId: organization._id,
      permissions: [
        { resource: 'workflow', actions: ['create', 'read', 'update', 'delete', 'execute', 'manage'] },
        { resource: 'execution', actions: ['read', 'delete'] },
        { resource: 'credential', actions: ['create', 'read', 'update', 'delete'] },
        { resource: 'member', actions: ['create', 'read', 'update', 'delete'] }
      ],
      isSystem: true
    });

    await OrganizationMember.create({
      organizationId: organization._id,
      userId: req.userId,
      roleId: ownerRole._id,
      status: 'active'
    });

    res.status(201).json(organization);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getOrganizations(req, res) {
  try {
    const memberships = await OrganizationMember.find({
      userId: req.userId,
      status: 'active',
      deletedAt: null
    }).populate('organizationId');

    const organizations = memberships.map(m => m.organizationId).filter(o => o && !o.deletedAt);

    res.json(organizations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getOrganization(req, res) {
  try {
    const { organizationId } = req.params;

    const organization = await Organization.findOne({
      _id: organizationId,
      deletedAt: null
    });

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    res.json(organization);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateOrganization(req, res) {
  try {
    const { organizationId } = req.params;
    const { name, description, logo } = req.body;

    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    if (name) organization.name = name;
    if (description !== undefined) organization.description = description;
    if (logo !== undefined) organization.logo = logo;

    await organization.save();

    res.json(organization);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
