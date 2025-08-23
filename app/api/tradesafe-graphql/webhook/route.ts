import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { tradesafeGraphQL } from '@/lib/tradesafe-graphql';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get('x-tradesafe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Parse the webhook payload
    const webhookData = JSON.parse(payload);
    const { transactionId, event, data } = webhookData;

    // Verify the webhook signature (implement based on TradeSafe docs)
    // For now, we'll skip verification in development
    if (process.env.NODE_ENV === 'production') {
      // Implement signature verification here
    }

    // Handle different webhook events
    switch (event) {
      case 'transaction.created':
        console.log('Transaction created:', data);
        break;

      case 'transaction.funded':
        // Update order status when transaction is funded
        await handleTransactionFunded(transactionId, data);
        break;

      case 'transaction.completed':
        // Update order status when transaction is completed
        await handleTransactionCompleted(transactionId, data);
        break;

      case 'transaction.cancelled':
        // Update order status when transaction is cancelled
        await handleTransactionCancelled(transactionId, data);
        break;

      case 'allocation.accepted':
        console.log('Allocation accepted:', data);
        break;

      default:
        console.log('Unhandled webhook event:', event);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('TradeSafe GraphQL webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' }, 
      { status: 500 }
    );
  }
}

async function handleTransactionFunded(transactionId: string, data: any) {
  try {
    // Find order by transaction ID in instructions field
    const order = await prisma.order.findFirst({
      where: {
        instructions: {
          contains: transactionId,
        },
      },
    });

    if (order) {
      await prisma.order.update({
        where: { id: order.id },
        data: { 
          status: 'processing',
          updatedAt: new Date(),
        },
      });
      console.log(`Order ${order.id} updated to processing status`);
    }
  } catch (error) {
    console.error('Error handling transaction funded:', error);
  }
}

async function handleTransactionCompleted(transactionId: string, data: any) {
  try {
    // Find order by transaction ID in instructions field
    const order = await prisma.order.findFirst({
      where: {
        instructions: {
          contains: transactionId,
        },
      },
    });

    if (order) {
      await prisma.order.update({
        where: { id: order.id },
        data: { 
          status: 'shipped',
          updatedAt: new Date(),
        },
      });
      console.log(`Order ${order.id} updated to shipped status`);
    }
  } catch (error) {
    console.error('Error handling transaction completed:', error);
  }
}

async function handleTransactionCancelled(transactionId: string, data: any) {
  try {
    // Find order by transaction ID in instructions field
    const order = await prisma.order.findFirst({
      where: {
        instructions: {
          contains: transactionId,
        },
      },
    });

    if (order) {
      await prisma.order.update({
        where: { id: order.id },
        data: { 
          status: 'canceled',
          updatedAt: new Date(),
        },
      });
      console.log(`Order ${order.id} updated to canceled status`);
    }
  } catch (error) {
    console.error('Error handling transaction cancelled:', error);
  }
}
