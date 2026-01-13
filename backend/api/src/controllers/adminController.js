import { Plan, User, Organization, Subscription } from '@n8n-clone/shared';

export async function createPlan(req, res) {
  try {
    if (!req.user.isSuperAdmin) {
      return res.status(403).json({ error: 'Super admin access required' });
    }

    const plan = await Plan.create(req.body);
    res.status(201).json(plan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getPlans(req, res) {
  try {
    const filter = req.user.isSuperAdmin ? {} : { isPublished: true };
    const plans = await Plan.find({ ...filter, deletedAt: null }).sort({ sortOrder: 1 });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function updatePlan(req, res) {
  try {
    if (!req.user.isSuperAdmin) {
      return res.status(403).json({ error: 'Super admin access required' });
    }

    const { planId } = req.params;
    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    Object.assign(plan, req.body);
    await plan.save();

    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getSystemStats(req, res) {
  try {
    if (!req.user.isSuperAdmin) {
      return res.status(403).json({ error: 'Super admin access required' });
    }

    const stats = {
      totalUsers: await User.countDocuments({ deletedAt: null }),
      totalOrganizations: await Organization.countDocuments({ deletedAt: null }),
      activeSubscriptions: await Subscription.countDocuments({ status: 'active' })
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
