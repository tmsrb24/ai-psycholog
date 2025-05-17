import { loadStripe, Stripe } from '@stripe/stripe-js';

// Initialize Stripe with the publishable key
let stripePromise: Promise<Stripe | null>;

const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');
  }
  return stripePromise;
};

export default getStripe;
