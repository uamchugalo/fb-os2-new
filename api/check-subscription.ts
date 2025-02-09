import { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { customerId } = req.query;

  if (!customerId) {
    return res.status(400).json({ message: 'Customer ID is required' });
  }

  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId as string,
      status: 'active',
    });

    res.status(200).json({
      hasActiveSubscription: subscriptions.data.length > 0,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error checking subscription status' });
  }
}
