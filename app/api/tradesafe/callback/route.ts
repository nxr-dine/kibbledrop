/**
 * TradeSafe Webhook Callback API Route
 * 
 * This endpoint handles TradeSafe webhook notifications when transaction
 * states change (e.g., FUNDS_RECEIVED, COMPLETED, CANCELLED, etc.).
 * 
 * POST /api/tradesafe/callback
 */

import { NextRequest, NextResponse } from 'next/server';
import * as crypto from 'crypto';
import { prisma } from '@/lib/prisma';

// TypeScript interface for TradeSafe webhook payload
interface TradeSafeWebhookPayload {
  event_type?: string;      // Event type (e.g., transaction.funds_received)
  data: {
    id: string;            // Transaction ID
    state?: string;        // Transaction state (FUNDS_RECEIVED, COMPLETED, etc.)
    reference?: string;    // Transaction reference
    updated_at?: string;   // Last update timestamp
    [key: string]: any;    // Additional data fields
  };
}

/**
 * Verify webhook signature using HMAC-SHA256
 * TradeSafe signs webhooks with your webhook secret for security
 */
function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    // Step 3a: Create HMAC signature using the webhook secret
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload, 'utf8')
      .digest('hex');
    
    // Step 3b: Remove any prefix from the provided signature (e.g., "sha256=")
    const providedSignature = signature.replace(/^sha256=/, '');
    
    // Step 3c: Compare signatures securely using timing-safe comparison
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(providedSignature, 'hex')
    );
  } catch (error) {
    console.error('❌ Error verifying webhook signature:', error);
    return false;
  }
}

/**
 * POST /api/tradesafe/callback
 * 
 * Handles webhook notifications from TradeSafe
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔔 Received TradeSafe webhook notification');

    // Step 1: Get the webhook secret from environment variables
    const webhookSecret = process.env.TRADESAFE_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      console.error('❌ TRADESAFE_WEBHOOK_SECRET not configured in environment variables');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // Step 2: Parse the incoming JSON body and get the signature
    const body = await request.text();
    const signature = request.headers.get('x-tradesafe-signature') || '';

    if (!signature) {
      console.error('❌ No x-tradesafe-signature header provided');
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 401 }
      );
    }

    // Step 3: Verify the webhook signature using crypto.createHmac
    console.log('🔐 Verifying webhook signature...');
    const isValidSignature = verifyWebhookSignature(body, signature, webhookSecret);
    
    // Step 4: If verification fails, return 401 Unauthorized
    if (!isValidSignature) {
      console.error('❌ Invalid webhook signature - request rejected');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    console.log('✅ Webhook signature verified successfully');

    // Step 5: Parse the JSON payload now that we know it's authentic
    let payload: TradeSafeWebhookPayload;
    
    try {
      payload = JSON.parse(body);
    } catch (error) {
      console.error('❌ Invalid JSON payload:', error);
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    // Step 5: Log the event type and transaction ID from the payload
    const eventType = payload.event_type || payload.data?.state || 'UNKNOWN_EVENT';
    const transactionId = payload.data?.id;

    console.log('📋 Webhook Event Details:');
    console.log(`📊 Event Type: ${eventType}`);
    console.log(`🆔 Transaction ID: ${transactionId}`);
    console.log(`📅 Updated At: ${payload.data?.updated_at || 'N/A'}`);
    console.log(`🔗 Reference: ${payload.data?.reference || 'N/A'}`);

    // Log the full payload for debugging purposes
    console.log('📦 Full Webhook Payload:', JSON.stringify(payload, null, 2));

    // Step 6: Update trade status in database if transaction ID is provided
    let databaseUpdate = null;
    if (transactionId) {
      try {
        console.log('💾 Updating trade status in database...');
        
        // Find and update the trade in our database using the TradeSafe transaction ID
        const updatedTrade = await prisma.trade.updateMany({
          where: {
            tradeId: transactionId // Match by TradeSafe transaction ID
          },
          data: {
            status: eventType, // Update status with the event type from webhook
            updatedAt: new Date() // Ensure updatedAt is current
          }
        });

        if (updatedTrade.count > 0) {
          console.log(`✅ Updated ${updatedTrade.count} trade record(s) in database`);
          databaseUpdate = {
            success: true,
            updatedRecords: updatedTrade.count,
            newStatus: eventType
          };
        } else {
          console.log('⚠️ No matching trade found in database');
          databaseUpdate = {
            success: false,
            reason: 'No matching trade found',
            searchedTradeId: transactionId
          };
        }
        
      } catch (dbError) {
        console.error('❌ Database update failed:', dbError);
        databaseUpdate = {
          success: false,
          error: dbError instanceof Error ? dbError.message : 'Unknown database error'
        };
      }
    } else {
      console.log('⚠️ No transaction ID provided in webhook payload');
      databaseUpdate = {
        success: false,
        reason: 'No transaction ID in payload'
      };
    }

    // Handle different event types (can be extended as needed)
    switch (eventType) {
      case 'FUNDS_RECEIVED':
      case 'transaction.funds_received':
        console.log('💰 Funds have been received for this transaction');
        break;
      case 'COMPLETED':
      case 'transaction.completed':
        console.log('✅ Transaction has been completed successfully');
        break;
      case 'CANCELLED':
      case 'transaction.cancelled':
        console.log('❌ Transaction has been cancelled');
        break;
      case 'REFUNDED':
      case 'transaction.refunded':
        console.log('💸 Transaction has been refunded');
        break;
      default:
        console.log(`ℹ️ Received event type: ${eventType}`);
    }

    // Step 7: Always return a 200 response when verification passes
    console.log('✅ Webhook processed successfully');
    
    return NextResponse.json(
      {
        success: true,
        message: 'Webhook received and processed',
        eventType,
        transactionId,
        databaseUpdate, // Include database update status in response
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('❌ Error processing TradeSafe webhook:', error);
    
    // Return 500 so TradeSafe will retry the webhook
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

/**
 * Only accept POST requests - reject all other HTTP methods
 */
export async function GET() {
  return NextResponse.json(
    { 
      error: 'Method not allowed',
      message: 'This endpoint only accepts POST requests for TradeSafe webhooks'
    },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { 
      error: 'Method not allowed',
      message: 'This endpoint only accepts POST requests for TradeSafe webhooks'
    },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { 
      error: 'Method not allowed',
      message: 'This endpoint only accepts POST requests for TradeSafe webhooks'
    },
    { status: 405 }
  );
}
