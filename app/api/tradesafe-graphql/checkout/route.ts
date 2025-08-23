import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { tradesafeGraphQL } from '@/lib/tradesafe-graphql';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { items, customerInfo } = await request.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Invalid items' }, { status: 400 });
    }

    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);

    // Step 1: Create user tokens for buyer and seller
    const buyerToken = await tradesafeGraphQL.createUserToken({
      email: customerInfo.email,
      mobile: customerInfo.phone,
      givenName: customerInfo.firstName,
      familyName: customerInfo.lastName,
    });

    // Create seller token (your business)
    const sellerToken = await tradesafeGraphQL.createUserToken({
      email: process.env.BUSINESS_EMAIL || 'admin@kibbledrop.com',
      givenName: 'KibbleDrop',
      familyName: 'Store',
    });

    // Step 2: Create transaction
    const transaction = await tradesafeGraphQL.createTransaction({
      title: `KibbleDrop Order - ${items.length} item(s)`,
      description: `Pet food order from KibbleDrop`,
      currency: 'ZAR',
      value: Math.round(totalAmount * 100), // Convert to cents
      feeAllocation: 'BUYER',
      parties: {
        buyer: buyerToken.token,
        seller: sellerToken.token,
      },
      allocations: items.map(item => ({
        title: item.name,
        description: `${item.quantity}x ${item.name}`,
        value: Math.round(item.price * item.quantity * 100), // Convert to cents
        daysToDeliver: 7,
        daysToInspect: 3,
      })),
    });

    // Step 3: Create payment link
    const paymentLink = await tradesafeGraphQL.createPaymentLink(transaction.id);

    // Create order in database
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        status: 'pending',
        subtotal: totalAmount,
        shipping: 0, // Free shipping for now
        total: totalAmount,
        deliveryName: `${customerInfo.firstName} ${customerInfo.lastName}`,
        deliveryPhone: customerInfo.phone,
        deliveryAddress: customerInfo.address,
        city: customerInfo.city,
        postalCode: customerInfo.postalCode,
        deliveryMethod: 'standard',
        instructions: `TradeSafe Transaction ID: ${transaction.id}`,
        items: {
          create: items.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      transactionId: transaction.id,
      paymentUrl: paymentLink.url,
      reference: transaction.reference,
    });

  } catch (error) {
    console.error('TradeSafe GraphQL checkout error:', error);
    return NextResponse.json(
      { 
        error: 'Payment initialization failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}
