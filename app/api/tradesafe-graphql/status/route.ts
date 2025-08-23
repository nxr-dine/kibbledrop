import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { tradesafeGraphQL } from '@/lib/tradesafe-graphql';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get('transactionId');

    if (!transactionId) {
      return NextResponse.json({ error: 'Transaction ID required' }, { status: 400 });
    }

    const transaction = await tradesafeGraphQL.getTransaction(transactionId);

    return NextResponse.json({
      success: true,
      transaction,
    });

  } catch (error) {
    console.error('TradeSafe GraphQL status error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get transaction status',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}
