'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TradesafeCheckout } from '@/components/tradesafe-checkout';
import { PaymentStatus } from '@/components/payment-status';
import { useTradesafe } from '@/hooks/use-tradesafe';
import { toast } from 'sonner';

export default function TestTradesafePage() {
  const { checkPaymentStatus } = useTradesafe();
  const [orderId, setOrderId] = useState('');
  const [paymentId, setPaymentId] = useState('');
  const [orderDetails, setOrderDetails] = useState<any>(null);

  // Sample products for testing
  const sampleProducts = [
    {
      productId: 'test-product-1',
      name: 'Test Product 1',
      price: 99.99,
      quantity: 1
    },
    {
      productId: 'test-product-2',
      name: 'Test Product 2',
      price: 149.99,
      quantity: 2
    }
  ];

  const handleCheckoutSuccess = (orderId: string) => {
    setOrderId(orderId);
    toast.success(`Order created successfully: ${orderId}`);
  };

  const handleCheckoutError = (error: string) => {
    toast.error(`Checkout failed: ${error}`);
  };

  const handleStatusCheck = async () => {
    if (!orderId && !paymentId) {
      toast.error('Please provide an Order ID or Payment ID');
      return;
    }

    try {
      const result = await checkPaymentStatus(orderId, paymentId);
      if (result) {
        setOrderDetails(result);
        toast.success('Payment status retrieved successfully');
      }
    } catch (error) {
      toast.error('Failed to check payment status');
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Tradesafe Payment Integration Test</h1>
          <p className="text-gray-600 mt-2">
            Test the Tradesafe payment gateway integration
          </p>
        </div>

        <Tabs defaultValue="checkout" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="checkout">Checkout</TabsTrigger>
            <TabsTrigger value="status">Payment Status</TabsTrigger>
            <TabsTrigger value="demo">Demo</TabsTrigger>
          </TabsList>

          <TabsContent value="checkout" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Test Checkout</CardTitle>
                <CardDescription>
                  Create a test order using Tradesafe payment gateway
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TradesafeCheckout
                  items={sampleProducts}
                  onSuccess={handleCheckoutSuccess}
                  onError={handleCheckoutError}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="status" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Check Payment Status</CardTitle>
                <CardDescription>
                  Check the status of a payment using Order ID or Payment ID
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="order-id">Order ID</Label>
                    <Input
                      id="order-id"
                      placeholder="Enter Order ID"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="payment-id">Payment ID</Label>
                    <Input
                      id="payment-id"
                      placeholder="Enter Payment ID"
                      value={paymentId}
                      onChange={(e) => setPaymentId(e.target.value)}
                    />
                  </div>
                </div>
                
                <Button onClick={handleStatusCheck} className="w-full">
                  Check Status
                </Button>

                {orderDetails && (
                  <PaymentStatus
                    orderId={orderDetails.orderId}
                    paymentId={orderDetails.paymentId}
                    initialStatus={orderDetails.status}
                    amount={orderDetails.total}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="demo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Integration Demo</CardTitle>
                <CardDescription>
                  See how the Tradesafe integration works
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                    <li>User selects products and clicks checkout</li>
                    <li>System creates order and Tradesafe payment session</li>
                    <li>User is redirected to Tradesafe payment page</li>
                    <li>After payment, user returns to success/cancel page</li>
                    <li>Webhook updates order status in real-time</li>
                    <li>User can check payment status anytime</li>
                  </ol>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2">Features:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-green-800">
                    <li>Secure payment processing</li>
                    <li>Real-time webhook updates</li>
                    <li>Payment status tracking</li>
                    <li>Error handling and retry mechanisms</li>
                    <li>Mobile-responsive checkout</li>
                    <li>Subscription and one-time payments</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-900 mb-2">Environment:</h4>
                  <p className="text-sm text-yellow-800">
                    Currently running in <strong>sandbox mode</strong>. 
                    Set <code>TRADESAFE_ENVIRONMENT=production</code> for live payments.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card>
          <CardHeader>
            <CardTitle>API Endpoints</CardTitle>
            <CardDescription>
              Available Tradesafe API endpoints
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="font-mono">POST /api/tradesafe/checkout</span>
                <Badge variant="secondary">Create payment</Badge>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="font-mono">GET /api/tradesafe/payment-status</span>
                <Badge variant="secondary">Check status</Badge>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="font-mono">POST /api/tradesafe/webhook</span>
                <Badge variant="secondary">Payment updates</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Badge component for the demo
function Badge({ variant, children }: { variant: 'secondary', children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
      {children}
    </span>
  );
}

