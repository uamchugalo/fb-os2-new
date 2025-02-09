require('dotenv').config();
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Helper para verificar autenticação
const authenticateUser = async (req) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      throw new Error('Token não fornecido');
    }

    const { data, error } = await supabase.auth.getUser(token);
    
    if (error) {
      throw error;
    }
    
    if (!data.user) {
      throw new Error('Usuário não encontrado');
    }

    return data.user;
  } catch (error) {
    throw error;
  }
};

// Rota de status da assinatura
app.get('/api/subscription-status', async (req, res) => {
  try {
    const user = await authenticateUser(req);

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (profileError) {
      throw profileError;
    }

    if (!profile?.stripe_customer_id) {
      return res.json({ status: 'never_subscribed' });
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: profile.stripe_customer_id,
      status: 'active',
      limit: 1
    });

    if (subscriptions.data.length === 0) {
      return res.json({ status: 'inactive' });
    }

    return res.json({
      status: 'active',
      subscription: subscriptions.data[0]
    });
  } catch (error) {
    console.error('Erro:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Rota de criação de checkout
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const user = await authenticateUser(req);

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (profileError) {
      throw profileError;
    }

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_id: user.id
        }
      });
      customerId = customer.id;

      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{
        price: process.env.STRIPE_PRICE_ID,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${req.headers.origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/pricing`,
      allow_promotion_codes: true
    });

    return res.json({ url: session.url });
  } catch (error) {
    console.error('Erro:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Rota de teste
app.get('/', (req, res) => {
  res.json({ status: 'API está funcionando!' });
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
