import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization header' });
  }

  try {
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error('Erro ao verificar usuário:', userError);
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profiles?.stripe_customer_id) {
      console.error('Erro ao buscar perfil:', profileError);
      return res.status(404).json({ error: 'Customer not found' });
    }

    const customer = await stripe.customers.retrieve(profiles.stripe_customer_id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found in Stripe' });
    }

    const { data: subscriptions } = await stripe.subscriptions.list({
      customer: customer.id,
      limit: 1,
      status: 'active',
    });

    const activeSubscription = subscriptions[0];
    if (!activeSubscription) {
      return res.json({ status: 'never_subscribed' });
    }

    const response = { 
      status: 'active',
      subscription: {
        id: activeSubscription.id,
        status: activeSubscription.status,
        current_period_end: new Date(activeSubscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: activeSubscription.cancel_at_period_end,
        plan: {
          id: activeSubscription.plan.id,
          product: activeSubscription.plan.product
        }
      }
    };

    return res.json(response);
  } catch (error) {
    console.error('Erro ao verificar assinatura:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
