/**
 * TradeButton Component
 * 
 * A simple React component that creates a TradeSafe trade by calling
 * the /api/tradesafe/trade endpoint and displays the results.
 */

"use client";

import { useState } from 'react';

// TypeScript interface for the API response
interface TradeResponse {
  success: boolean;
  message?: string;
  graphqlResponse?: {
    data?: {
      transactionCreate?: {
        id: string;
        createdAt: string;
        status: string;
      };
    };
  };
  transactionData?: {
    transactionCreate?: {
      id: string;
      createdAt: string;
      status: string;
    };
  };
  error?: string;
}

export default function TradeButton() {
  // State management for loading, trade data, and errors
  const [isLoading, setIsLoading] = useState(false);
  const [tradeData, setTradeData] = useState<TradeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle trade creation by calling the API endpoint
   */
  const handleCreateTrade = async () => {
    // Reset previous state
    setError(null);
    setTradeData(null);
    
    // Set loading state to true
    setIsLoading(true);

    try {
      console.log('🚀 Creating trade...');

      // Call the API route /api/tradesafe/trade using fetch
      const response = await fetch('/api/tradesafe/trade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // No body needed as the API uses default sample data
      });

      // Parse the JSON response
      const result: TradeResponse = await response.json();

      console.log('📋 Trade result:', result);

      // Check if the request was successful
      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      // Handle API-level errors
      if (!result.success) {
        throw new Error(result.error || 'Trade creation failed');
      }

      // Store the successful trade data
      setTradeData(result);
      console.log('✅ Trade created successfully');

    } catch (err) {
      // Handle and display errors if the request fails
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('❌ Error creating trade:', errorMessage);
      setError(errorMessage);
    } finally {
      // Always stop loading state
      setIsLoading(false);
    }
  };

  // Extract trade details for display
  const transactionDetails = tradeData?.transactionData?.transactionCreate || 
                            tradeData?.graphqlResponse?.data?.transactionCreate;

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      {/* Component title */}
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        TradeSafe Integration
      </h2>

      {/* Create Trade button with loading state */}
      <button
        onClick={handleCreateTrade}
        disabled={isLoading}
        className={`
          w-full px-4 py-2 rounded-md font-medium transition-colors
          ${isLoading 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
          }
          text-white
        `}
      >
        {isLoading ? (
          // Show loading state while request is in progress
          <span className="flex items-center justify-center">
            <svg 
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Creating Trade...
          </span>
        ) : (
          'Create Trade'
        )}
      </button>

      {/* Display trade ID and status when trade is created */}
      {tradeData && transactionDetails && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            ✅ Trade Created Successfully!
          </h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium text-gray-700">Trade ID:</span>
              <span className="ml-2 font-mono text-gray-900">
                {transactionDetails.id}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Status:</span>
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                {transactionDetails.status}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Created:</span>
              <span className="ml-2 text-gray-600">
                {new Date(transactionDetails.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Display errors if the request fails */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            ❌ Error Creating Trade
          </h3>
          <p className="text-sm text-red-700">
            {error}
          </p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Instructions for extending the component */}
      {!tradeData && !error && !isLoading && (
        <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
          <p className="text-xs text-gray-600">
            💡 Click "Create Trade" to test the TradeSafe integration. 
            This will create a sample transaction using the configured API.
          </p>
        </div>
      )}
    </div>
  );
}
