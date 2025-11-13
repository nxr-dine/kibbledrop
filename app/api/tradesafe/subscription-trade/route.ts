/**
 * TradeSafe Subscription Trade Creation API
 *
 * This endpoint creates a TradeSafe trade specifically for subscription payments
 * with ZAR currency and recurring billing metadata.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getTradeSafeUrls } from "@/lib/tradesafe-config";
import { prisma } from "@/lib/prisma";

interface SubscriptionTradeRequest {
  orderId: string;
  subscriptionId: string;
  totalAmount: number;
  currency: "ZAR";
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
    name: string;
  }>;
  deliveryInfo: {
    address: string;
    city: string;
    postalCode: string;
    instructions?: string;
  };
  description: string;
  title: string;
}

interface TokenResponse {
  success: boolean;
  access_token: string;
  token_type: string;
  expires_in: number;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: SubscriptionTradeRequest = await request.json();
    const {
      orderId,
      subscriptionId,
      totalAmount,
      customer,
      items,
      deliveryInfo,
      description,
      title,
    } = body;

    console.log("🚀 Creating TradeSafe subscription trade...");
    console.log("💰 Amount:", totalAmount, "ZAR");
    console.log("📦 Subscription ID:", subscriptionId);

    // Step 1: Get access token
    console.log("🔑 Getting TradeSafe access token...");
    const tokenResponse = await fetch(
      `${
        process.env.NEXTAUTH_URL || "http://localhost:3000"
      }/api/tradesafe/token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!tokenResponse.ok) {
      throw new Error(`Token request failed: ${tokenResponse.status}`);
    }

    const tokenData: TokenResponse = await tokenResponse.json();
    if (!tokenData.success) {
      throw new Error("Failed to obtain access token");
    }

    // Step 2: Get GraphQL URL
    const { graphqlUrl } = getTradeSafeUrls();
    console.log("🌐 Using GraphQL endpoint:", graphqlUrl);

    // Step 3: Create subscription trade
    const createTransactionMutation = `
      mutation CreateSubscriptionTransaction($input: TransactionCreateInput!) {
        transactionCreate(input: $input) {
          id
          createdAt
          status
          reference
          total
          paymentUrl
        }
      }
    `;

    // Convert amount to cents for TradeSafe (ZAR)
    const amountInCents = Math.round(totalAmount * 100);

    const mutationVariables = {
      input: {
        title: title,
        description: `${description}\n\nSubscription Details:\n${items
          .map(
            (item) =>
              `- ${item.name} x${item.quantity} @ R${item.price.toFixed(2)}`
          )
          .join("\n")}\n\nDelivery: ${deliveryInfo.address}, ${
          deliveryInfo.city
        } ${deliveryInfo.postalCode}`,
        industry: "GENERAL_GOODS_SERVICES",
        currency: "ZAR",
        feeAllocation: "BUYER", // Customer pays TradeSafe fees
        allocations: [
          {
            title: "Pet Food Subscription - First Delivery",
            description: `Initial payment for recurring pet food subscription. Future deliveries will be automatically billed.`,
            value: amountInCents, // Amount in cents
            daysToDeliver: 3, // 3 days to deliver
            daysToInspect: 2, // 2 days to inspect
          },
        ],
        parties: [
          {
            role: "BUYER",
            contact: {
              fullName: customer.name,
              email: customer.email,
              mobile: customer.phone.startsWith("+27")
                ? customer.phone
                : `+27${customer.phone.replace(/^0/, "")}`,
            },
          },
          {
            role: "SELLER",
            contact: {
              fullName: "Kibbledrop",
              email: process.env.BUSINESS_EMAIL || "orders@kibbledrop.com",
              mobile: process.env.BUSINESS_PHONE || "+27123456789",
            },
          },
        ],
        // Add metadata for recurring billing
        metadata: {
          subscriptionId,
          orderId,
          isRecurring: true,
          nextBillingDate: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
          ).toISOString(), // 1 week from now
          recurringAmount: totalAmount,
          recurringFrequency: "weekly", // This should come from subscription
        },
      },
    };

    // Step 4: Execute GraphQL mutation
    console.log("🔄 Creating TradeSafe transaction...");
    const graphqlResponse = await fetch(graphqlUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: createTransactionMutation,
        variables: mutationVariables,
      }),
    });

    if (!graphqlResponse.ok) {
      throw new Error(`GraphQL request failed: ${graphqlResponse.status}`);
    }

    const graphqlResult = await graphqlResponse.json();

    if (graphqlResult.errors) {
      console.error("❌ GraphQL errors:", graphqlResult.errors);
      throw new Error(
        `GraphQL error: ${graphqlResult.errors[0]?.message || "Unknown error"}`
      );
    }

    const transaction = graphqlResult.data?.transactionCreate;
    if (!transaction) {
      throw new Error("No transaction data returned from TradeSafe");
    }

    console.log("✅ TradeSafe transaction created successfully");
    console.log("🆔 Transaction ID:", transaction.id);
    console.log("💳 Payment URL:", transaction.paymentUrl);

    // Step 5: Update order with TradeSafe transaction ID
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentId: transaction.id,
        status: "payment_pending",
        metadata: JSON.stringify({
          tradesafeTransactionId: transaction.id,
          subscriptionId,
          isRecurring: true,
          paymentUrl: transaction.paymentUrl,
        }),
      },
    });

    // Step 6: Update subscription with payment information
    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: "payment_pending",
        // Add TradeSafe-specific fields if needed
      },
    });

    return NextResponse.json({
      success: true,
      tradeId: transaction.id,
      paymentUrl: transaction.paymentUrl,
      reference: transaction.reference,
      totalAmount,
      currency: "ZAR",
    });
  } catch (error) {
    console.error("❌ Error creating TradeSafe subscription trade:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create payment",
        details: "Please check your subscription details and try again.",
      },
      { status: 500 }
    );
  }
}
