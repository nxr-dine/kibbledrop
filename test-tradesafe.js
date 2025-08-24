#!/usr/bin/env node

/**
 * TradeSafe Integration Test Script
 * Tests all TradeSafe API endpoints to ensure they work correctly
 */

const readline = require('readline');

// Create interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const BASE_URL = 'http://localhost:3000';

// Helper function to make HTTP requests
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.json();
    return { response, data };
  } catch (error) {
    console.error('❌ Request failed:', error.message);
    return { error };
  }
}

// Test functions
async function testTokenEndpoint() {
  console.log('\n🔑 Testing Token Endpoint...');
  console.log('➡️  POST /api/tradesafe/token');
  
  const { response, data, error } = await makeRequest(`${BASE_URL}/api/tradesafe/token`, {
    method: 'POST'
  });
  
  if (error) {
    console.log('❌ Token endpoint failed');
    return false;
  }
  
  console.log(`📊 Status: ${response.status}`);
  console.log(`✅ Success: ${data.success}`);
  
  if (data.success) {
    console.log(`🎫 Token Type: ${data.token_type}`);
    console.log(`⏰ Expires In: ${data.expires_in}s`);
    console.log('✅ Token endpoint working correctly');
    return true;
  } else {
    console.log('❌ Token endpoint returned error:', data.error);
    return false;
  }
}

async function testTradeCreation() {
  console.log('\n🏪 Testing Trade Creation...');
  console.log('➡️  POST /api/tradesafe/trade');
  
  const { response, data, error } = await makeRequest(`${BASE_URL}/api/tradesafe/trade`, {
    method: 'POST'
  });
  
  if (error) {
    console.log('❌ Trade creation failed');
    return null;
  }
  
  console.log(`📊 Status: ${response.status}`);
  console.log(`✅ Success: ${data.success}`);
  
  if (data.success) {
    console.log(`🆔 Transaction ID: ${data.transactionData?.transactionCreate?.id || 'N/A'}`);
    console.log(`📊 Status: ${data.transactionData?.transactionCreate?.status || 'N/A'}`);
    
    if (data.databaseSave) {
      console.log(`💾 Database Save: ${data.databaseSave.success ? '✅ Success' : '❌ Failed'}`);
      if (data.databaseSave.success) {
        console.log(`🗄️  Database ID: ${data.databaseSave.tradeId}`);
        console.log(`🔗 TradeSafe ID: ${data.databaseSave.tradeSafeId}`);
      }
    }
    
    console.log('✅ Trade creation working correctly');
    return data.transactionData?.transactionCreate?.id;
  } else {
    console.log('❌ Trade creation failed:', data.error);
    console.log('📋 GraphQL Errors:', data.graphqlErrors);
    return null;
  }
}

async function testWebhookEndpoint() {
  console.log('\n🔔 Testing Webhook Endpoint...');
  console.log('➡️  POST /api/tradesafe/callback');
  
  // Test webhook with sample payload
  const samplePayload = {
    event_type: 'FUNDS_RECEIVED',
    data: {
      id: 'test_transaction_123',
      state: 'FUNDS_RECEIVED',
      reference: 'TEST-REF-123',
      updated_at: new Date().toISOString()
    }
  };
  
  // Note: This will fail signature verification, but we can test the endpoint structure
  const { response, data, error } = await makeRequest(`${BASE_URL}/api/tradesafe/callback`, {
    method: 'POST',
    body: JSON.stringify(samplePayload)
  });
  
  if (error) {
    console.log('❌ Webhook endpoint failed');
    return false;
  }
  
  console.log(`📊 Status: ${response.status}`);
  
  if (response.status === 401) {
    console.log('✅ Webhook correctly rejecting unsigned requests');
    console.log('📝 This is expected behavior for security');
    return true;
  } else {
    console.log('⚠️  Unexpected webhook response:', data);
    return false;
  }
}

async function testDemoPage() {
  console.log('\n🎭 Testing Demo Page...');
  console.log('➡️  GET /trade-demo');
  
  const { response, error } = await makeRequest(`${BASE_URL}/trade-demo`);
  
  if (error) {
    console.log('❌ Demo page failed to load');
    return false;
  }
  
  console.log(`📊 Status: ${response.status}`);
  
  if (response.status === 200) {
    console.log('✅ Demo page loading correctly');
    return true;
  } else {
    console.log('❌ Demo page returned error status');
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 TradeSafe Integration Testing Started');
  console.log('==========================================');
  
  const results = {
    token: false,
    trade: false,
    webhook: false,
    demo: false
  };
  
  // Test each endpoint
  results.token = await testTokenEndpoint();
  results.trade = await testTradeCreation();
  results.webhook = await testWebhookEndpoint();
  results.demo = await testDemoPage();
  
  // Summary
  console.log('\n📊 Test Results Summary');
  console.log('========================');
  console.log(`🔑 Token Endpoint:    ${results.token ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`🏪 Trade Creation:    ${results.trade ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`🔔 Webhook Security:  ${results.webhook ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`🎭 Demo Page:         ${results.demo ? '✅ PASS' : '❌ FAIL'}`);
  
  const totalPassed = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n🎯 Overall: ${totalPassed}/${totalTests} tests passed`);
  
  if (totalPassed === totalTests) {
    console.log('🎉 All tests passed! TradeSafe integration is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please check the logs above.');
  }
  
  rl.close();
}

// Wait for user to confirm server is running
console.log('🔍 TradeSafe Integration Test Suite');
console.log('===================================');
console.log('📋 This script will test all TradeSafe API endpoints');
console.log('🌐 Make sure the development server is running on http://localhost:3000');
console.log('');

rl.question('Press Enter to start testing when server is ready...', () => {
  runTests().catch(console.error);
});
