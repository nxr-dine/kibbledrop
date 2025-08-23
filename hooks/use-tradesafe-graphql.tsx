import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export interface TradesafeGraphQLCheckoutData {
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    country?: string;
  };
}

export interface TradesafeGraphQLResponse {
  success: boolean;
  orderId?: string;
  transactionId?: string;
  paymentUrl?: string;
  reference?: string;
  error?: string;
  message?: string;
}

export function useTradesafeGraphQL() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCheckout = async (checkoutData: TradesafeGraphQLCheckoutData): Promise<TradesafeGraphQLResponse> => {
    if (!session?.user) {
      throw new Error('Authentication required');
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/tradesafe-graphql/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(checkoutData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Checkout failed');
      }

      if (result.success && result.paymentUrl) {
        toast.success('Payment session created successfully!');
        // Redirect to TradeSafe payment page
        window.location.href = result.paymentUrl;
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const checkTransactionStatus = async (transactionId: string) => {
    try {
      const response = await fetch(`/api/tradesafe-graphql/status?transactionId=${transactionId}`);
      const result = await response.json();
      return result;
    } catch (err) {
      console.error('Error checking transaction status:', err);
      throw err;
    }
  };

  return {
    createCheckout,
    checkTransactionStatus,
    isLoading,
    error,
  };
}
