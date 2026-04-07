// Test script to verify the BigServer integration
import { getServerUrl, getServerUrlWithFallback, checkBigServerAvailability } from './src/services/serverUrlService';

async function testIntegration() {
  console.log('🧪 Testing BigServer Integration...\n');

  // Test 1: Check BigServer availability
  console.log('1. Checking BigServer availability...');
  try {
    const isAvailable = await checkBigServerAvailability();
    console.log(`   BigServer available: ${isAvailable ? '✅ Yes' : '❌ No'}`);
  } catch (error) {
    console.log(`   Error checking availability: ${error.message}`);
  }

  // Test 2: Test valid combinations
  console.log('\n2. Testing valid amount/room combinations...');
  const testCases = [
    { amount: 10, room: 1 },
    { amount: 10, room: 2 },
    { amount: 20, room: 1 },
    { amount: 100, room: 2 },
    { amount: 200, room: 1 }
  ];

  for (const testCase of testCases) {
    try {
      console.log(`   Testing ${testCase.amount}&room${testCase.room}...`);
      const result = await getServerUrl(testCase.amount, testCase.room);
      console.log(`   ✅ Success: ${result.data.serverName} (${result.data.serverUrl})`);
      console.log(`   Connected: ${result.data.connected ? '✅' : '❌'}`);
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }

  // Test 3: Test invalid combination
  console.log('\n3. Testing invalid combination...');
  try {
    console.log('   Testing 999&room1...');
    const result = await getServerUrl(999, 1);
    console.log(`   Unexpected success: ${result}`);
  } catch (error) {
    console.log(`   ✅ Expected error: ${error.message}`);
  }

  // Test 4: Test fallback functionality
  console.log('\n4. Testing fallback functionality...');
  try {
    console.log('   Testing 50&room1 with fallback...');
    const result = await getServerUrlWithFallback(50, 1);
    console.log(`   ✅ Success: ${result.serverName} (${result.serverUrl})`);
    console.log(`   Fallback mode: ${result.isFallback ? '✅ Yes' : '❌ No'}`);
    console.log(`   Connected: ${result.connected ? '✅' : '❌'}`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  console.log('\n🎉 Integration test completed!');
}

// Run the test
testIntegration().catch(console.error);
