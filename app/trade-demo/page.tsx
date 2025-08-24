/**
 * Trade Button Demo Page
 *
 * A simple page to demonstrate the TradeButton component
 * Navigate to /trade-demo to test the component
 */

import TradeButton from "@/components/trade-button";

export default function TradeDemoPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            TradeSafe Integration Demo
          </h1>
          <p className="text-gray-600">
            Test the TradeButton component and TradeSafe API integration
          </p>
        </div>

        <TradeButton />

        <div className="mt-12 max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Component Features
          </h2>
          <ul className="space-y-2 text-gray-600">
            <li>✅ Clean "Create Trade" button interface</li>
            <li>✅ Loading state with spinner during API calls</li>
            <li>✅ Displays trade ID and status on success</li>
            <li>✅ Error handling and display</li>
            <li>✅ Well-commented code for easy extension</li>
            <li>✅ TypeScript interfaces for type safety</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: "Trade Button Demo | KibbleDrop",
  description: "Test the TradeSafe integration with the TradeButton component",
};
