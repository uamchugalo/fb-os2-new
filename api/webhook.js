import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  if (!sig) {
    return res.status(400).json({ error: 'No signature' });
  }

  try {
    const event = stripe.webhooks.constructEvent(
      await buffer(req),
      sig,
      endpointSecret
    );

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        const subscription = event.data.object;
        console.log('Subscription event:', event.type, subscription.id);
        
        // Atualizar status da assinatura no banco
        const { error } = await supabase
          .from('subscriptions')
          .upsert({
            id: subscription.id,
            user_id: subscription.metadata.user_id,
            status: subscription.status,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end
          });

        if (error) {
          console.error('Error updating subscription:', error);
          return res.status(500).json({ error: 'Database error' });
        }
        break;
      
      default:
        console.log('Unhandled event type:', event.type);
    }

    return res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};

async function buffer(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}
