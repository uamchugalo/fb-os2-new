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

    const session = await stripe.billingPortal.sessions.create({
      customer: profiles.stripe_customer_id,
      return_url: process.env.NEXT_PUBLIC_APP_URL,
    });

    return res.json({ url: session.url });
  } catch (error) {
    console.error('Erro ao criar sessão do portal:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
