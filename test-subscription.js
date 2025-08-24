#!/usr/bin/env node

/**
 * Test script for subscription API endpoint
 * This script simulates the subscription creation flow
 */

// Using built-in fetch (Node.js 18+)

const BASE_URL = "http://localhost:3000";

// Test data simulating a typical subscription request
const testSubscriptionData = {
  petProfileId: "test-pet-profile-123",
  frequency: "monthly",
  deliveryName: "John Doe",
  deliveryPhone: "+27123456789",
  deliveryAddress: "123 Main Street, Suburb",
  city: "Cape Town",
  postalCode: "8001",
  instructions: "Please leave at the gate",
  items: [
    {
      productId: "product-1",
      quantity: 2,
    },
    {
      productId: "product-2",
      quantity: 1,
    },
  ],
};

// Test data with missing fields
const testIncompleteData = {
  frequency: "monthly",
  deliveryName: "Jane Doe",
  // Missing required fields intentionally
  items: [
    {
      productId: "product-1",
      quantity: 1,
    },
  ],
};

async function testSubscriptionAPI() {
  console.log("🧪 Testing Subscription API\n");

  try {
    // Test 1: Complete data
    console.log("📋 Test 1: Complete subscription data");
    console.log("Sending:", JSON.stringify(testSubscriptionData, null, 2));

    const response1 = await fetch(`${BASE_URL}/api/subscription`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testSubscriptionData),
    });

    const result1 = await response1.json();
    console.log(`Status: ${response1.status}`);
    console.log("Response:", JSON.stringify(result1, null, 2));
    console.log("\n" + "=".repeat(50) + "\n");

    // Test 2: Incomplete data
    console.log("📋 Test 2: Incomplete subscription data (missing fields)");
    console.log("Sending:", JSON.stringify(testIncompleteData, null, 2));

    const response2 = await fetch(`${BASE_URL}/api/subscription`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testIncompleteData),
    });

    const result2 = await response2.json();
    console.log(`Status: ${response2.status}`);
    console.log("Response:", JSON.stringify(result2, null, 2));
    console.log("\n" + "=".repeat(50) + "\n");

    // Test 3: Empty data
    console.log("📋 Test 3: Empty data");
    console.log("Sending: {}");

    const response3 = await fetch(`${BASE_URL}/api/subscription`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    const result3 = await response3.json();
    console.log(`Status: ${response3.status}`);
    console.log("Response:", JSON.stringify(result3, null, 2));
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

// Test authentication endpoint
async function testAuthEndpoint() {
  console.log("\n🔐 Testing Authentication Status\n");

  try {
    const response = await fetch(`${BASE_URL}/api/auth/session`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();
    console.log(`Auth Status: ${response.status}`);
    console.log("Session:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("❌ Auth test failed:", error.message);
  }
}

// Health check
async function healthCheck() {
  console.log("🏥 Health Check\n");

  try {
    const response = await fetch(`${BASE_URL}/api/health`, {
      method: "GET",
    });

    if (response.ok) {
      const result = await response.json();
      console.log("✅ Server is healthy");
      console.log("Response:", JSON.stringify(result, null, 2));
    } else {
      console.log("❌ Server health check failed");
    }
  } catch (error) {
    console.error("❌ Cannot connect to server:", error.message);
    console.log("\n💡 Make sure the dev server is running with: npm run dev");
    return false;
  }

  return true;
}

// Main test runner
async function runTests() {
  console.log("🚀 Starting API Tests for KibbleDrop Subscription\n");

  // Check if server is running
  const serverReady = await healthCheck();
  if (!serverReady) {
    process.exit(1);
  }

  console.log("\n" + "=".repeat(50) + "\n");

  // Run auth test
  await testAuthEndpoint();

  console.log("\n" + "=".repeat(50) + "\n");

  // Run subscription tests
  await testSubscriptionAPI();

  console.log("\n✅ All tests completed!\n");
  console.log(
    '💡 Check the terminal running "npm run dev" for detailed server logs'
  );
}

// Run the tests
runTests().catch(console.error);
