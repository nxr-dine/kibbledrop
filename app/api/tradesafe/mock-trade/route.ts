/**
 * TradeSafe Mock Mode for Development
 * 
 * This endpoint provides mock TradeSafe responses for development/testing
 * when real credentials are not available.
 * 
 * POST /api/tradesafe/mock-trade
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🎭 Creating mock TradeSafe transaction...');

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock TradeSafe transaction response
    const mockTransactionId = `mock_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    const mockResponse = {
      success: true,
      message: 'Mock transaction created successfully',
      mockData: true,
      transactionData: {
        transactionCreate: {
          id: mockTransactionId,
          createdAt: new Date().toISOString(),
          status: 'PENDING'
        }
      },
      databaseSave: {
        success: true,
        tradeId: `mock_db_${Date.now()}`,
        tradeSafeId: mockTransactionId,
        note: 'Saved to database with mock data',
        error: null as string | null
      },
      metadata: {
        mode: 'MOCK_DEVELOPMENT',
        tokenType: 'Bearer',
        graphqlEndpoint: 'https://api-developer.tradesafe.dev/graphql',
        timestamp: new Date().toISOString(),
        warning: 'This is a mock response for development. Real TradeSafe credentials needed for production.'
      }
    };

    // Save mock trade to database
    try {
      const { prisma } = await import('@/lib/prisma');
      
      const savedTrade = await (prisma as any).trade.create({
        data: {
          tradeId: mockTransactionId,
          status: 'PENDING',
          buyerEmail: 'mock-buyer@example.com',
          sellerEmail: 'mock-seller@example.com',
          amount: 1000.00,
          currency: 'ZAR',
          title: 'Mock TradeSafe Transaction',
          reference: `MOCK-${Date.now()}`
        }
      });

      console.log('✅ Mock trade saved to database:', savedTrade.id);
      
      mockResponse.databaseSave.tradeId = savedTrade.id;
      mockResponse.databaseSave.success = true;
      
    } catch (dbError) {
      console.error('❌ Mock database save failed:', dbError);
      mockResponse.databaseSave.success = false;
      mockResponse.databaseSave.error = dbError instanceof Error ? dbError.message : 'Database error';
    }

    return NextResponse.json(mockResponse);

  } catch (error) {
    console.error('❌ Mock transaction failed:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Mock transaction failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'TradeSafe Mock Mode',
    description: 'This endpoint provides mock TradeSafe responses for development',
    usage: 'POST to this endpoint to create a mock transaction',
    note: 'Use real TradeSafe credentials for production',
    endpoints: {
      'POST /api/tradesafe/mock-trade': 'Create mock transaction',
      'GET /mock-trade-demo': 'Demo page for mock testing'
    }
  });
}
