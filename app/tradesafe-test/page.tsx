/**
 * TradeSafe Integration Test Page
 * 
 * This page provides a complete testing interface for the TradeSafe GraphQL API integration.
 * Navigate to /tradesafe-test to use this page.
 */

import TradesafeIntegrationDemo from '@/components/tradesafe-integration-demo';

export default function TradesafeTestPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <TradesafeIntegrationDemo />
    </div>
  );
}

export const metadata = {
  title: 'TradeSafe Integration Test | KibbleDrop',
  description: 'Test the TradeSafe GraphQL API integration',
};
