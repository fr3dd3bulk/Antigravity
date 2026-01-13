import { Subscription, Plan } from '@n8n-clone/shared';

export async function getSubscription(req, res) {
  try {
    const { organizationId } = req.params;

    const subscription = await Subscription.findOne({
      organizationId,
      deletedAt: null
    }).populate('planId');

    if (!subscription) {
      return res.status(404).json({ error: 'No active subscription' });
    }

    res.json(subscription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function createSubscription(req, res) {
  try {
    const { organizationId } = req.params;
    const { planId } = req.body;

    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + plan.trialDays);

    const subscription = await Subscription.create({
      organizationId,
      planId,
      status: plan.trialDays > 0 ? 'trialing' : 'active',
      trialStart: plan.trialDays > 0 ? new Date() : null,
      trialEnd: plan.trialDays > 0 ? trialEnd : null,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });

    res.status(201).json(subscription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
