import Stripe from 'stripe';

let stripeClient = null;

const initStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('⚠️  STRIPE_SECRET_KEY not set. Stripe features will be disabled.');
    return null;
  }

  try {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });
    console.log('✅ Stripe initialized');
    return stripeClient;
  } catch (error) {
    console.error('❌ Error initializing Stripe:', error.message);
    return null;
  }
};

const getStripeClient = () => {
  if (!stripeClient) {
    throw new Error('Stripe client not initialized. Call initStripe() first.');
  }
  return stripeClient;
};

export { initStripe, getStripeClient };
