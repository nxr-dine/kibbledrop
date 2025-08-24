/**
 * TradeSafe GraphQL API Demo Page
 *
 * This page demonstrates the complete TradeSafe integration including:
 * - OAuth 2.0 authentication
 * - Trade/transaction creation
 * - Webhook handling
 * - Real-time updates
 */

import TradesafeDemo from "@/components/tradesafe-demo";

export default function TradesafeDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <TradesafeDemo />
    </div>
  );
}

export const metadata = {
  title: "TradeSafe GraphQL API Demo - KibbleDrop",
  description:
    "Complete demonstration of TradeSafe GraphQL API integration with OAuth 2.0, transaction creation, and webhook handling",
};
