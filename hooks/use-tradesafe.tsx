import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';

interface TradesafeCheckoutData {
  subscriptionId?: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  customerInfo?: {
    name?: string;
    phone?: string;
  };
}

interface TradesafePaymentResponse {
  success: boolean;
  paymentId?: string;
  redirectUrl?: string;
  orderId?: string;
  error?: string;
}

interface PaymentStatus {
  orderId: string;
  status: string;
  paymentStatus: string;
  total: number;
  paymentId?: string;
  transactionId?: string;
  createdAt: string;
  paymentCompletedAt?: string;
}

export const useTradesafe = () => {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCheckout = useCallback(async (data: TradesafeCheckoutData): Promise<TradesafePaymentResponse> => {
    if (!session?.user) {
      setError('User not authenticated');
      return { success: false, error: 'User not authenticated' };
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/tradesafe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Checkout failed');
        return { success: false, error: result.error || 'Checkout failed' };
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Checkout failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  const checkPaymentStatus = useCallback(async (orderId?: string, paymentId?: string): Promise<PaymentStatus | null> => {
    if (!session?.user) {
      setError('User not authenticated');
      return null;
    }

    if (!orderId && !paymentId) {
      setError('Order ID or Payment ID is required');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (orderId) params.append('orderId', orderId);
      if (paymentId) params.append('paymentId', paymentId);

      const response = await fetch(`/api/tradesafe/payment-status?${params.toString()}`);
      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Failed to check payment status');
        return null;
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check payment status';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  const redirectToPayment = useCallback((redirectUrl: string) => {
    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    createCheckout,
    checkPaymentStatus,
    redirectToPayment,
    isLoading,
    error,
    clearError,
  };
};

