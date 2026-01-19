import Organization from '../../models/Organization.js';
import User from '../../models/User.js';

/**
 * Get organization details
 */
export const getOrganization = async (req, res) => {
  try {
    const org = await Organization.findById(req.user.orgId);
    
    if (!org) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    res.json({ organization: org });
  } catch (error) {
    console.error('Get organization error:', error);
    res.status(500).json({ error: 'Failed to fetch organization' });
  }
};

/**
 * Update organization
 */
export const updateOrganization = async (req, res) => {
  try {
    const { name } = req.body;

    const org = await Organization.findByIdAndUpdate(
      req.user.orgId,
      { $set: { name } },
      { new: true, runValidators: true }
    );

    if (!org) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    res.json({
      message: 'Organization updated successfully',
      organization: org,
    });
  } catch (error) {
    console.error('Update organization error:', error);
    res.status(500).json({ error: 'Failed to update organization' });
  }
};

/**
 * Get organization members
 */
export const getMembers = async (req, res) => {
  try {
    const members = await User.find({ orgId: req.user.orgId })
      .select('-passwordHash')
      .sort({ createdAt: -1 });

    res.json({
      members,
      count: members.length,
    });
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
};
