'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useTradesafeGraphQL } from '@/hooks/use-tradesafe-graphql';
import { useCart } from '@/contexts/cart-context';
import { toast } from 'sonner';

export function TradesafeGraphQLCheckout() {
  const { data: session } = useSession();
  const router = useRouter();
  const { state: cartState, dispatch } = useCart();
  const { createCheckout, isLoading } = useTradesafeGraphQL();

  const [customerInfo, setCustomerInfo] = useState({
    firstName: '',
    lastName: '',
    email: session?.user?.email || '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'South Africa',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user) {
      toast.error('Please log in to continue');
      router.push('/login');
      return;
    }

    if (cartState.items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'postalCode'];
    const missingFields = requiredFields.filter(field => !customerInfo[field as keyof typeof customerInfo]);

    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    try {
      const checkoutData = {
        items: cartState.items.map((item: any) => ({
          id: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        customerInfo,
      };

      await createCheckout(checkoutData);
      // The hook will handle redirecting to the payment URL
      dispatch({ type: 'CLEAR_CART' });
    } catch (error) {
      console.error('Checkout error:', error);
    }
  };

  if (!session?.user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Authentication Required</CardTitle>
          <CardDescription>
            Please log in to proceed with checkout.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.push('/login')}>
            Log In
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (cartState.items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Empty Cart</CardTitle>
          <CardDescription>
            Your cart is empty. Add some products before checkout.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.push('/products')}>
            Browse Products
          </Button>
        </CardContent>
      </Card>
    );
  }

  const totalPrice = cartState.total;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Customer Information Form */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Information</CardTitle>
          <CardDescription>
            Enter your delivery details for the order.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={customerInfo.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={customerInfo.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={customerInfo.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={customerInfo.phone}
                onChange={handleInputChange}
                required
                placeholder="+27 XX XXX XXXX"
              />
            </div>

            <div>
              <Label htmlFor="address">Street Address *</Label>
              <Input
                id="address"
                name="address"
                value={customerInfo.address}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  name="city"
                  value={customerInfo.city}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="postalCode">Postal Code *</Label>
                <Input
                  id="postalCode"
                  name="postalCode"
                  value={customerInfo.postalCode}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                name="country"
                value={customerInfo.country}
                onChange={handleInputChange}
                disabled
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : `Pay R${totalPrice.toFixed(2)} with TradeSafe`}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
          <CardDescription>
            Review your order before payment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {cartState.items.map((item: any) => (
              <div key={item.id} className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">{item.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Qty: {item.quantity} × R{item.price.toFixed(2)}
                  </p>
                </div>
                <p className="font-medium">
                  R{(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
            
            <Separator />
            
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total</span>
              <span>R{totalPrice.toFixed(2)}</span>
            </div>

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Payment Method</h4>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">TS</span>
                </div>
                <span className="text-sm">TradeSafe Secure Payment</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Secure escrow payment processing with buyer protection
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
