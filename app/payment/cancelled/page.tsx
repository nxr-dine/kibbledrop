'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, Home, ShoppingCart, RefreshCw } from 'lucide-react';
import Link from 'next/link';

function PaymentCancelledContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-600">
            Payment Cancelled
          </CardTitle>
          <CardDescription>
            Your payment was cancelled. No charges were made to your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {orderId && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Order ID:</span>
                <span className="font-mono text-sm">{orderId}</span>
              </div>
              <div className="text-center text-sm text-gray-500">
                You can retry the payment for this order anytime.
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Button asChild className="w-full" size="lg">
              <Link href="/checkout">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Payment Again
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full">
              <Link href="/products">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Continue Shopping
              </Link>
            </Button>

            <Button asChild variant="ghost" className="w-full">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>

          <div className="text-center text-sm text-gray-500 pt-4">
            <p>If you experienced any issues, please contact our support team.</p>
            <p>We're here to help you complete your order.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentCancelledPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentCancelledContent />
    </Suspense>
  );
}

