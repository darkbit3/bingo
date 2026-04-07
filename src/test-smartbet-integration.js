/**
 * Test file to verify Smart Bet integration
 * Run this in browser console to test the integration
 */

// Test Smart Bet Integration Service
console.log('🧪 Testing Smart Bet Integration...');

// Test 1: Check if service is available
if (typeof window.smartBetIntegration !== 'undefined') {
  console.log('✅ Smart Bet Integration Service loaded');
  
  // Test 2: Get current auth state
  const authState = window.smartBetIntegration.getAuthState();
  console.log('📊 Current Auth State:', authState);
  
  // Test 3: Get current user
  const user = window.smartBetIntegration.getCurrentUser();
  console.log('👤 Current User:', user);
  
  // Test 4: Get balance
  const balance = window.smartBetIntegration.getCurrentBalance();
  console.log('💰 Current Balance:', balance);
  
  // Test 5: Check authentication
  console.log('🔐 Is Authenticated:', window.smartBetIntegration.isAuthenticated());
  
  // Test 6: Get player ID
  console.log('📱 Player ID:', window.smartBetIntegration.getPlayerId());
  
  // Test 7: Get display name
  console.log('📛 Display Name:', window.smartBetIntegration.getDisplayName());
  
  // Test 8: Test betting limits
  const bettingLimits = window.smartBetIntegration.getBettingLimits(10);
  console.log('🎯 Betting Limits for 10 Birr:', bettingLimits);
  
  console.log('✅ Smart Bet Integration Test Complete!');
} else {
  console.log('❌ Smart Bet Integration Service not found');
  console.log('💡 Make sure SmartBetProvider is wrapping your app');
}

// Test 9: Simulate login (for testing)
function simulateSmartBetLogin() {
  console.log('🔧 Simulating Smart Bet Login...');
  
  // Simulate auth event
  const authEvent = {
    type: 'LOGIN_SUCCESS',
    data: {
      user: {
        id: 12345,
        username: 'TestUser',
        phone_number: '+251912345678',
        balance: 500.00,
        withdrawable: 300.00,
        non_withdrawable: 100.00,
        bonus_balance: 100.00,
        status: 'active'
      }
    }
  };
  
  // Store in localStorage
  localStorage.setItem('smartbet_auth_event', JSON.stringify(authEvent));
  
  // Trigger storage event
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'smartbet_auth_event',
    newValue: JSON.stringify(authEvent)
  }));
  
  console.log('✅ Login simulation complete! Refresh the page to see changes.');
}

// Test 10: Simulate logout (for testing)
function simulateSmartBetLogout() {
  console.log('🔧 Simulating Smart Bet Logout...');
  
  const authEvent = {
    type: 'LOGOUT',
    data: {}
  };
  
  localStorage.setItem('smartbet_auth_event', JSON.stringify(authEvent));
  
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'smartbet_auth_event',
    newValue: JSON.stringify(authEvent)
  }));
  
  console.log('✅ Logout simulation complete! Refresh the page to see changes.');
}

// Test 11: Simulate balance update
function simulateBalanceUpdate(newBalance) {
  console.log('🔧 Simulating Balance Update...');
  
  const balanceEvent = {
    type: 'BALANCE_UPDATE',
    data: {
      balance: newBalance,
      withdrawable: newBalance * 0.6,
      non_withdrawable: newBalance * 0.2,
      bonus_balance: newBalance * 0.2
    }
  };
  
  localStorage.setItem('smartbet_auth_event', JSON.stringify(balanceEvent));
  
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'smartbet_auth_event',
    newValue: JSON.stringify(balanceEvent)
  }));
  
  console.log(`✅ Balance update simulation complete! New balance: ${newBalance}`);
}

// Export test functions for console use
 window.testSmartBetIntegration = {
  simulateLogin: simulateSmartBetLogin,
  simulateLogout: simulateSmartBetLogout,
  simulateBalanceUpdate: simulateBalanceUpdate,
  runTests: function() {
    console.clear();
    console.log('🧪 Running Smart Bet Integration Tests...');
    // Re-run the main test
    location.reload();
  }
};

console.log('🎮 Test functions available:');
console.log('  - testSmartBetIntegration.simulateLogin()');
console.log('  - testSmartBetIntegration.simulateLogout()');
console.log('  - testSmartBetIntegration.simulateBalanceUpdate(amount)');
console.log('  - testSmartBetIntegration.runTests()');
