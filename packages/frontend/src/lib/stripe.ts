import { loadStripe } from '@stripe/stripe-js';
import { supabase } from './supabase';

const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
const API_URL = 'SUA_URL_DO_RAILWAY'; // Substitua isso pela URL que o Railway te der

export const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

// Verificar status da assinatura
export const checkSubscriptionStatus = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Não autenticado');
    }

    const response = await fetch(`${API_URL}/api/subscription-status`, {
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro:', error);
    throw error;
  }
};

// Criar sessão de checkout
export const createCheckoutSession = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Não autenticado');
    }

    const response = await fetch(`${API_URL}/api/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    const { url } = await response.json();
    window.location.href = url;
  } catch (error) {
    console.error('Erro:', error);
    throw error;
  }
};
