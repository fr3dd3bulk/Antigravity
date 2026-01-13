import { User, Organization, OrganizationMember, Role, generateToken } from '@n8n-clone/shared';

export async function register(req, res) {
  try {
    const { email, password, firstName, lastName, organizationName } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const user = await User.create({
      email,
      password,
      firstName,
      lastName
    });

    let organization;
    if (organizationName) {
      const slug = organizationName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      organization = await Organization.create({
        name: organizationName,
        slug,
        ownerId: user._id
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
        userId: user._id,
        roleId: ownerRole._id,
        status: 'active'
      });
    }

    const token = generateToken({ userId: user._id });

    res.status(201).json({
      token,
      user,
      organization
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is inactive' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken({ userId: user._id });

    const organizations = await OrganizationMember.find({
      userId: user._id,
      status: 'active',
      deletedAt: null
    }).populate('organizationId');

    res.json({
      token,
      user: user.toJSON(),
      organizations: organizations.map(m => m.organizationId)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getMe(req, res) {
  try {
    const user = await User.findById(req.userId);
    const organizations = await OrganizationMember.find({
      userId: req.userId,
      status: 'active',
      deletedAt: null
    }).populate('organizationId');

    res.json({
      user,
      organizations: organizations.map(m => m.organizationId)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
