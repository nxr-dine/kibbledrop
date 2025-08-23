'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { useTradesafe } from '@/hooks/use-tradesafe';

interface PaymentStatusProps {
  orderId?: string;
  paymentId?: string;
  initialStatus?: string;
  amount?: number;
  onStatusChange?: (status: string) => void;
}

const statusConfig = {
  pending: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
    description: 'Payment is being processed'
  },
  payment_pending: {
    label: 'Payment Pending',
    color: 'bg-blue-100 text-blue-800',
    icon: Clock,
    description: 'Waiting for payment confirmation'
  },
  paid: {
    label: 'Paid',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
    description: 'Payment completed successfully'
  },
  failed: {
    label: 'Failed',
    color: 'bg-red-100 text-red-800',
    icon: XCircle,
    description: 'Payment failed or was declined'
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-gray-100 text-gray-800',
    icon: XCircle,
    description: 'Payment was cancelled'
  }
};

export function PaymentStatus({ 
  orderId, 
  paymentId, 
  initialStatus = 'pending',
  amount,
  onStatusChange 
}: PaymentStatusProps) {
  const { checkPaymentStatus, isLoading } = useTradesafe();
  const [status, setStatus] = useState(initialStatus);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const currentStatus = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  const StatusIcon = currentStatus.icon;

  const refreshStatus = async () => {
    if (!orderId && !paymentId) return;

    try {
      const result = await checkPaymentStatus(orderId, paymentId);
      if (result) {
        setStatus(result.status);
        setLastChecked(new Date());
        onStatusChange?.(result.status);
      }
    } catch (error) {
      console.error('Failed to refresh payment status:', error);
    }
  };

  useEffect(() => {
    if (orderId || paymentId) {
      refreshStatus();
    }
  }, [orderId, paymentId]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <StatusIcon className="w-5 h-5" />
          Payment Status
        </CardTitle>
        <CardDescription>
          Current status of your payment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Badge className={currentStatus.color}>
              {currentStatus.label}
            </Badge>
            <p className="text-sm text-gray-600">
              {currentStatus.description}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshStatus}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {(orderId || paymentId) && (
          <div className="bg-gray-50 p-3 rounded-lg space-y-2 text-sm">
            {orderId && (
              <div className="flex justify-between">
                <span className="font-medium">Order ID:</span>
                <span className="font-mono">{orderId}</span>
              </div>
            )}
            {paymentId && (
              <div className="flex justify-between">
                <span className="font-medium">Payment ID:</span>
                <span className="font-mono">{paymentId}</span>
              </div>
            )}
            {amount && (
              <div className="flex justify-between">
                <span className="font-medium">Amount:</span>
                <span className="font-semibold">R{amount.toFixed(2)}</span>
              </div>
            )}
            {lastChecked && (
              <div className="flex justify-between">
                <span className="font-medium">Last Updated:</span>
                <span className="text-gray-600">
                  {lastChecked.toLocaleTimeString()}
                </span>
              </div>
            )}
          </div>
        )}

        {status === 'failed' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="text-sm text-red-800">
                <p className="font-medium">Payment Failed</p>
                <p>Please try again or contact support if the issue persists.</p>
              </div>
            </div>
          </div>
        )}

        {status === 'cancelled' && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <XCircle className="w-5 h-5 text-gray-600 mt-0.5" />
              <div className="text-sm text-gray-800">
                <p className="font-medium">Payment Cancelled</p>
                <p>You can retry the payment anytime from your order history.</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

