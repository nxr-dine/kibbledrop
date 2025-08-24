/**
 * Database integration test for Trade model
 */

import { NextRequest, NextResponse } from 'next/server';

// Import prisma using dynamic import to avoid TypeScript issues during development
export async function GET() {
  try {
    console.log('🗄️  Testing database Trade model...');

    // Dynamic import to handle potential TypeScript issues
    const { prisma } = await import('@/lib/prisma');

    // Test creating a trade record
    const testTrade = await (prisma as any).trade.create({
      data: {
        tradeId: `test_${Date.now()}`,
        status: 'PENDING',
        buyerEmail: 'buyer@test.com',
        sellerEmail: 'seller@test.com',
        amount: 100.00,
        currency: 'ZAR',
        title: 'Database Test Trade',
        reference: `TEST-${Date.now()}`
      }
    });

    console.log('✅ Trade created in database:', testTrade.id);

    // Test updating the trade
    const updatedTrade = await (prisma as any).trade.update({
      where: { id: testTrade.id },
      data: { status: 'COMPLETED' }
    });

    console.log('✅ Trade updated in database');

    // Test reading the trade
    const foundTrade = await (prisma as any).trade.findUnique({
      where: { id: testTrade.id }
    });

    console.log('✅ Trade found in database');

    // Cleanup - delete the test trade
    await (prisma as any).trade.delete({
      where: { id: testTrade.id }
    });

    console.log('✅ Test trade cleaned up');

    return NextResponse.json({
      success: true,
      message: 'Database Trade model is working correctly',
      test_results: {
        create: '✅ Success',
        update: '✅ Success',
        read: '✅ Success',
        delete: '✅ Success'
      },
      trade_data: {
        id: testTrade.id,
        tradeId: testTrade.tradeId,
        original_status: testTrade.status,
        updated_status: updatedTrade.status
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Database test failed:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Database test failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
