'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, CreditCard } from 'lucide-react';

function MockPaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [processing, setProcessing] = useState(false);

  const paymentId = searchParams.get('paymentId');
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');

  const handlePaymentSuccess = async () => {
    setProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if this is a subscription payment
    const isSubscriptionPayment = paymentId?.includes('mock');
    
    if (isSubscriptionPayment) {
      // Redirect to subscription success page
      router.push(`/payment/subscription-success?orderId=${orderId}`);
    } else {
      // Redirect to regular payment success page
      router.push(`/payment/success?orderId=${orderId}`);
    }
  };

  const handlePaymentCancel = () => {
    router.push(`/payment/cancelled?orderId=${orderId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <CreditCard className="h-6 w-6" />
            Mock Payment Gateway
          </CardTitle>
          <CardDescription>
            Development Environment - Mock TradeSafe Payment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Payment Details</h3>
            <div className="space-y-1 text-sm text-blue-800">
              <p><strong>Payment ID:</strong> {paymentId}</p>
              <p><strong>Order ID:</strong> {orderId}</p>
              <p><strong>Amount:</strong> ${amount}</p>
            </div>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> This is a mock payment gateway for development testing. 
              No real payment will be processed.
            </p>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handlePaymentSuccess} 
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={processing}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {processing ? 'Processing...' : 'Simulate Successful Payment'}
            </Button>
            
            <Button 
              onClick={handlePaymentCancel} 
              variant="outline" 
              className="w-full"
              disabled={processing}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Cancel Payment
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function MockPaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment...</p>
        </div>
      </div>
    }>
      <MockPaymentContent />
    </Suspense>
  );
}
