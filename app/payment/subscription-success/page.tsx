'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Calendar, Package, Home } from 'lucide-react';
import Link from 'next/link';

function SubscriptionSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      completeSubscriptionPayment(orderId);
    }
  }, [orderId]);

  const completeSubscriptionPayment = async (orderId: string) => {
    try {
      const response = await fetch('/api/subscription/complete-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId }),
      });

      if (response.ok) {
        const data = await response.json();
        setSubscription(data.subscription);
      } else {
        console.error('Failed to complete subscription payment');
      }
    } catch (error) {
      console.error('Error completing subscription payment:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <p>Completing your subscription...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-600">
            Subscription Created!
          </CardTitle>
          <CardDescription>
            Your payment was successful and your subscription is now active.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {subscription && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Subscription ID:</span>
                <span className="text-sm font-mono">{subscription.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Frequency:</span>
                <span className="text-sm capitalize">{subscription.frequency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <span className="text-sm text-green-600 font-medium">Active</span>
              </div>
              {subscription.nextBillingDate && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Next Delivery:</span>
                  <span className="text-sm">
                    {new Date(subscription.nextBillingDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/dashboard/subscription/manage">
                <Calendar className="w-4 h-4 mr-2" />
                Manage Subscription
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/products">
                <Package className="w-4 h-4 mr-2" />
                Continue Shopping
              </Link>
            </Button>
            
            <Button asChild variant="ghost" className="w-full">
              <Link href="/dashboard">
                <Home className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Link>
            </Button>
          </div>

          <div className="text-center pt-4 border-t">
            <p className="text-sm text-gray-600">
              You will receive a confirmation email shortly with your subscription details.
            </p>
            <p className="text-sm text-gray-600 mt-2">
              If you have any questions, please contact our support team.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SubscriptionSuccessContent />
    </Suspense>
  );
}
