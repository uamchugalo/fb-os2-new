import { loadStripe } from '@stripe/stripe-js';
import { supabase } from './supabase';

const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
const API_URL = import.meta.env.VITE_API_URL;

export const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

// Verificar status da assinatura
export async function getSubscriptionStatus(token: string) {
  const response = await fetch(`${API_URL}/subscription-status`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get subscription status');
  }

  return response.json();
}

// Criar sessão de checkout
export async function createCheckoutSession(token: string) {
  const response = await fetch(`${API_URL}/create-checkout`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to create checkout session');
  }

  const { sessionId } = await response.json();
  return sessionId;
}
