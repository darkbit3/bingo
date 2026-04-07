/**
 * Test file to verify header displays no player ID or balance
 * Run this in browser console to test the header behavior
 */

console.log('🧪 Testing Header - No Player ID/Balance Display...');

// Test 1: Check if header elements are hidden
function testHeaderDisplay() {
  const headerElement = document.querySelector('[data-testid="bingo-header"]');
  if (headerElement) {
    console.log('✅ Header element found');
    
    // Check for player ID display (should not exist)
    const playerIdElements = headerElement.querySelectorAll('[data-testid="player-id"]');
    const balanceElements = headerElement.querySelectorAll('[data-testid="balance-display"]');
    
    console.log('📊 Player ID elements found:', playerIdElements.length);
    console.log('📊 Balance elements found:', balanceElements.length);
    
    if (playerIdElements.length === 0 && balanceElements.length === 0) {
      console.log('✅ SUCCESS: No player ID or balance elements found in header');
    } else {
      console.log('❌ FAILURE: Player ID or balance elements still visible');
    }
    
    // Check for login buttons (should not exist)
    const loginButtons = headerElement.querySelectorAll('button');
    const loginRelatedButtons = Array.from(loginButtons).filter(btn => 
      btn.textContent?.toLowerCase().includes('login') || 
      btn.textContent?.toLowerCase().includes('register')
    );
    
    console.log('📊 Login/Register buttons found:', loginRelatedButtons.length);
    
    if (loginRelatedButtons.length === 0) {
      console.log('✅ SUCCESS: No login/register buttons found in header');
    } else {
      console.log('❌ FAILURE: Login/register buttons still visible');
      loginRelatedButtons.forEach((btn, index) => {
        console.log(`  Button ${index + 1}:`, btn.textContent);
      });
    }
    
  } else {
    console.log('❌ Header element not found');
  }
}

// Test 2: Simulate bet attempt to trigger login
function testBetAttemptTrigger() {
  console.log('🔧 Testing bet attempt trigger...');
  
  // Find bet buttons or number selection elements
  const betButtons = document.querySelectorAll('[data-testid="bet-button"], [data-testid="number-select"]');
  
  if (betButtons.length > 0) {
    console.log('✅ Found bet elements, clicking first one...');
    betButtons[0].click();
    
    // Wait a moment for login page to appear
    setTimeout(() => {
      const loginPage = document.querySelector('[data-testid="smartbet-login-page"]');
      if (loginPage) {
        console.log('✅ SUCCESS: Login page appeared on bet attempt');
      } else {
        console.log('❌ FAILURE: Login page did not appear on bet attempt');
      }
    }, 1000);
    
  } else {
    console.log('⚠️ No bet elements found to test trigger');
  }
}

// Test 3: Check Smart Bet integration is working
function testSmartBetIntegration() {
  console.log('🔧 Testing Smart Bet integration...');
  
  if (typeof window.smartBetIntegration !== 'undefined') {
    console.log('✅ Smart Bet Integration Service available');
    
    const authState = window.smartBetIntegration.getAuthState();
    console.log('📊 Current Auth State:', authState.isAuthenticated ? 'Authenticated' : 'Not Authenticated');
    
    if (!authState.isAuthenticated) {
      console.log('✅ User is not authenticated (expected for testing)');
    } else {
      console.log('⚠️ User is already authenticated');
    }
    
  } else {
    console.log('❌ Smart Bet Integration Service not found');
  }
}

// Run all tests
function runAllTests() {
  console.clear();
  console.log('🧪 Running Header Display Tests...');
  console.log('=' .repeat(50));
  
  testHeaderDisplay();
  console.log('-' .repeat(30));
  
  testSmartBetIntegration();
  console.log('-' .repeat(30));
  
  testBetAttemptTrigger();
  console.log('-' .repeat(30));
  
  console.log('🎯 Header Display Tests Complete!');
  console.log('');
  console.log('📋 Expected Results:');
  console.log('  • No Player ID visible in header');
  console.log('  • No Balance visible in header');
  console.log('  • No Login/Register buttons in header');
  console.log('  • Login page appears only when trying to bet');
  console.log('  • Smart Bet integration working in background');
}

// Export test functions
window.testHeaderNoDisplay = {
  runTests: runAllTests,
  testHeaderDisplay,
  testBetAttemptTrigger,
  testSmartBetIntegration
};

console.log('🎮 Header Display Test Functions Available:');
console.log('  - testHeaderNoDisplay.runTests()');
console.log('  - testHeaderNoDisplay.testHeaderDisplay()');
console.log('  - testHeaderNoDisplay.testBetAttemptTrigger()');
console.log('  - testHeaderNoDisplay.testSmartBetIntegration()');

// Auto-run tests after 2 seconds
setTimeout(() => {
  console.log('🚀 Auto-running header display tests...');
  runAllTests();
}, 2000);
