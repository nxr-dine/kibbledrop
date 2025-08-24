'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertTriangle, Info } from 'lucide-react';

export default function MockTradeDemoPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const createMockTrade = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/tradesafe/mock-trade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create mock trade');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">TradeSafe Mock Demo</h1>
        <p className="text-gray-600">
          Test the TradeSafe integration with mock data while waiting for real credentials
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Development Mode:</strong> This demo uses mock data because real TradeSafe credentials are needed.
          See <code>TRADESAFE_CREDENTIALS_SETUP.md</code> for instructions on getting real credentials.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Mock Trade Creation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              This will create a mock TradeSafe transaction and save it to the database.
            </p>
            <ul className="text-sm text-gray-500 list-disc list-inside space-y-1">
              <li>Mock transaction ID generation</li>
              <li>Database persistence test</li>
              <li>Response format validation</li>
              <li>Error handling demonstration</li>
            </ul>
          </div>

          <Button 
            onClick={createMockTrade} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Mock Trade...
              </>
            ) : (
              'Create Mock Trade'
            )}
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Mock Trade Created Successfully!</strong>
                <details className="mt-2">
                  <summary className="cursor-pointer font-medium">View Response Details</summary>
                  <pre className="mt-2 text-xs bg-gray-50 p-3 rounded overflow-auto">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </details>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <h4 className="font-medium">To use real TradeSafe integration:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
              <li>Visit <a href="https://developer.tradesafe.co.za/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">TradeSafe Developer Portal</a></li>
              <li>Create a developer account and register your application</li>
              <li>Get your sandbox credentials (Client ID & Secret)</li>
              <li>Update your <code>.env</code> file with real credentials</li>
              <li>Use the <a href="/trade-demo" className="text-blue-600 hover:underline">real TradeSafe demo</a></li>
            </ol>
          </div>
          
          <div className="pt-4 border-t">
            <p className="text-sm text-gray-500">
              All integration code is complete and ready. Only real credentials are needed for production use.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
