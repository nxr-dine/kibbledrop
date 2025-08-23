'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTradesafe } from '@/hooks/use-tradesafe';
import { toast } from 'sonner';

interface TradesafeCheckoutProps {
  items: Array<{
    productId: string;
    quantity: number;
    name: string;
    price: number;
  }>;
  subscriptionId?: string;
  onSuccess?: (orderId: string) => void;
  onError?: (error: string) => void;
}

export function TradesafeCheckout({ 
  items, 
  subscriptionId, 
  onSuccess, 
  onError 
}: TradesafeCheckoutProps) {
  const { createCheckout, redirectToPayment, isLoading, error, clearError } = useTradesafe();
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
  });

  const totalAmount = items.reduce((total, item) => total + (item.price * item.quantity), 0);

  const handleCheckout = async () => {
    try {
      const result = await createCheckout({
        subscriptionId,
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        customerInfo: customerInfo.name || customerInfo.phone ? customerInfo : undefined,
      });

      if (result.success && result.redirectUrl) {
        toast.success('Redirecting to payment gateway...');
        onSuccess?.(result.orderId!);
        redirectToPayment(result.redirectUrl);
      } else {
        const errorMessage = result.error || 'Checkout failed';
        toast.error(errorMessage);
        onError?.(errorMessage);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Checkout failed';
      toast.error(errorMessage);
      onError?.(errorMessage);
    }
  };

  const handleInputChange = (field: 'name' | 'phone', value: string) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }));
    if (error) clearError();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Complete Your Order</CardTitle>
        <CardDescription>
          Secure payment powered by Tradesafe
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Order Summary */}
        <div className="space-y-2">
          <h4 className="font-medium">Order Summary</h4>
          <div className="space-y-1 text-sm">
            {items.map((item, index) => (
              <div key={index} className="flex justify-between">
                <span>{item.name} x {item.quantity}</span>
                <span>R{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-2 flex justify-between font-medium">
            <span>Total</span>
            <span>R{totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Customer Information */}
        <div className="space-y-3">
          <div>
            <Label htmlFor="customer-name">Full Name (Optional)</Label>
            <Input
              id="customer-name"
              type="text"
              placeholder="Enter your full name"
              value={customerInfo.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="customer-phone">Phone Number (Optional)</Label>
            <Input
              id="customer-phone"
              type="tel"
              placeholder="Enter your phone number"
              value={customerInfo.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
            />
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        {/* Checkout Button */}
        <Button
          onClick={handleCheckout}
          disabled={isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? 'Processing...' : `Pay R${totalAmount.toFixed(2)}`}
        </Button>

        {/* Security Notice */}
        <div className="text-xs text-gray-500 text-center">
          🔒 Your payment information is secure and encrypted
        </div>
      </CardContent>
    </Card>
  );
}

