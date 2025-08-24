/**
 * TradeSafe Trade Creation API Route
 *
 * This endpoint creates a trade/contract using TradeSafe's GraphQL API.
 * It demonstrates the complete flow from authentication to trade creation.
 *
 * POST /api/tradesafe/trade
 */

import { NextRequest, NextResponse } from "next/server";
import { getTradeSafeUrls } from "@/lib/tradesafe-config";
import { prisma } from "@/lib/prisma";

// TypeScript interfaces for API responses
interface TokenResponse {
  success: boolean;
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface GraphQLResponse<T = any> {
  data?: T;
  errors?: Array<{
    message: string;
    path?: string[];
  }>;
}

/**
 * POST /api/tradesafe/trade
 *
 * Creates a transaction using TradeSafe's real GraphQL mutation
 */
export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Starting TradeSafe trade creation process...");

    // Step 1: Fetch access token from our token endpoint
    console.log("🔑 Step 1: Fetching access token...");
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
      throw new Error(
        `Token request failed: ${tokenResponse.status} ${tokenResponse.statusText}`
      );
    }

    const tokenData: TokenResponse = await tokenResponse.json();

    if (!tokenData.success) {
      throw new Error("Failed to obtain access token");
    }

    console.log("✅ Access token obtained successfully");

    // Step 2: Get GraphQL URL from helper function (not hardcoded)
    console.log(
      "🌐 Step 2: Getting GraphQL URL from environment configuration..."
    );
    const { graphqlUrl } = getTradeSafeUrls();
    console.log(`📡 Using GraphQL endpoint: ${graphqlUrl}`);

    // Step 3: Prepare sample mutation to create a trade/contract
    console.log("� Step 3: Preparing GraphQL mutation for trade creation...");

    // Sample GraphQL mutation for creating a transaction with buyer and seller
    const createTransactionMutation = `
      mutation CreateTransaction($input: TransactionCreateInput!) {
        transactionCreate(input: $input) {
          id
          createdAt
          status
        }
      }
    `;

    // Variables for the mutation with exact structure specified
    const mutationVariables = {
      input: {
        title: "Sample Transaction",
        description: "Created via API",
        industry: "GENERAL_GOODS_SERVICES",
        currency: "ZAR",
        feeAllocation: "SELLER",
        allocations: [
          {
            title: "Item 1",
            description: "Test item",
            value: 1000,
            daysToDeliver: 7,
            daysToInspect: 3,
          },
        ],
        parties: [
          {
            role: "BUYER",
            contact: {
              fullName: "John Buyer",
              email: "buyer@example.com",
              mobile: "+27123456789",
            },
          },
          {
            role: "SELLER",
            contact: {
              fullName: "Sally Seller",
              email: "seller@example.com",
              mobile: "+27876543210",
            },
          },
        ],
      },
    };

    // Step 4: Execute GraphQL mutation using the access token
    console.log("🔄 Step 4: Executing GraphQL mutation...");
    console.log(
      "📤 Sending mutation:",
      JSON.stringify(
        { query: createTransactionMutation, variables: mutationVariables },
        null,
        2
      )
    );

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
      throw new Error(
        `GraphQL request failed: ${graphqlResponse.status} ${graphqlResponse.statusText}`
      );
    }

    const graphqlResult: GraphQLResponse = await graphqlResponse.json();

    console.log(
      "📋 GraphQL response received:",
      JSON.stringify(graphqlResult, null, 2)
    );

    // Step 5: Check for GraphQL errors and return response
    if (graphqlResult.errors && graphqlResult.errors.length > 0) {
      console.error("❌ GraphQL errors:", graphqlResult.errors);

      // Return GraphQL errors as JSON response
      return NextResponse.json(
        {
          success: false,
          error: "GraphQL mutation failed",
          graphqlErrors: graphqlResult.errors,
          graphqlResponse: graphqlResult,
        },
        { status: 400 }
      );
    }

    // Step 6: Save trade to database if GraphQL mutation was successful
    if (graphqlResult.data?.transactionCreate) {
      const tradeData = graphqlResult.data.transactionCreate;

      try {
        console.log("💾 Step 6: Saving trade to database...");

        // Save trade to database with TradeSafe response data
        const savedTrade = await prisma.trade.create({
          data: {
            tradeId: tradeData.id,
            status: tradeData.status,
            buyerEmail:
              mutationVariables.input.parties.find((p) => p.role === "BUYER")
                ?.contact.email || "",
            sellerEmail:
              mutationVariables.input.parties.find((p) => p.role === "SELLER")
                ?.contact.email || "",
            amount: mutationVariables.input.allocations.reduce(
              (sum, alloc) => sum + alloc.value,
              0
            ),
            currency: mutationVariables.input.currency,
            title: mutationVariables.input.title,
            reference: `TS-${tradeData.id}`, // Create reference using TradeSafe ID
          },
        });

        console.log("✅ Trade saved to database with ID:", savedTrade.id);

        return NextResponse.json({
          success: true,
          message:
            "Transaction created successfully using TradeSafe GraphQL API",
          graphqlResponse: graphqlResult,
          transactionData: graphqlResult.data,
          databaseSave: {
            success: true,
            tradeId: savedTrade.id,
            tradeSafeId: savedTrade.tradeId,
          },
          metadata: {
            tokenType: tokenData.token_type,
            graphqlEndpoint: graphqlUrl,
            timestamp: new Date().toISOString(),
          },
        });
      } catch (dbError) {
        console.error("❌ Database save failed:", dbError);

        // Still return success for TradeSafe creation but note database issue
        return NextResponse.json({
          success: true,
          message:
            "Transaction created successfully using TradeSafe GraphQL API",
          graphqlResponse: graphqlResult,
          transactionData: graphqlResult.data,
          databaseSave: {
            success: false,
            error:
              dbError instanceof Error
                ? dbError.message
                : "Unknown database error",
          },
          metadata: {
            tokenType: tokenData.token_type,
            graphqlEndpoint: graphqlUrl,
            timestamp: new Date().toISOString(),
          },
        });
      }
    }

    // Step 7: Return the GraphQL response as JSON (fallback if no transaction data)
    console.log("✅ Transaction created successfully");

    return NextResponse.json({
      success: true,
      message: "Transaction created successfully using TradeSafe GraphQL API",
      graphqlResponse: graphqlResult,
      transactionData: graphqlResult.data,
      metadata: {
        tokenType: tokenData.token_type,
        graphqlEndpoint: graphqlUrl,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ Error creating TradeSafe transaction:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create transaction",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
