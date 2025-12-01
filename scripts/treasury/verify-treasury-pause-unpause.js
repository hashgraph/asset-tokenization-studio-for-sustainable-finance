const { deployBondWaitTreasuryAndApplyRoles, getTreasuryByContractId } = require('./verify-treasury-persistence');
const { gatewayClient } = require('../shared/lib/gateway-client');
const { log, logSuccess, logError, logHeader, colors } = require('../shared/lib/logger');
const { config } = require('../shared/lib/config');
const { signTransaction, validateSigningConfig } = require('../shared/lib/transaction-signer');
const { publishSignedTransaction } = require('../shared/lib/infrastructure');

/**
 * Pause a treasury by sending a pause transaction
 * @param {string} contractId - Treasury contract ID
 */
async function pauseTreasury(contractId) {
  log(`\n⏸️  Pausing treasury ${contractId}...`, colors.yellow);
  
  const requestBody = {
    format: config.BLOCKCHAIN_FORMAT,
    accountId: process.env.ACCOUNT_ID
  };
  
  // Step 1: Get unsigned transaction from API
  const response = await gatewayClient.post(`/api/v1/treasuries/${contractId}/pause`, requestBody);
  const unsignedTx = response.data.unsignedTx;
  
  log(`   Unsigned transaction received`, colors.cyan);
  
  // Step 2: Sign the transaction
  const signedTx = await signTransaction(unsignedTx);
  logSuccess('Pause transaction signed successfully!');
  
  // Step 3: Publish to transaction sender
  await publishSignedTransaction(signedTx);
  logSuccess('Pause transaction published to message queue');
  
  return response.data;
}

/**
 * Unpause a treasury by sending an unpause transaction
 * @param {string} contractId - Treasury contract ID
 */
async function unpauseTreasury(contractId) {
  log(`\n▶️  Unpausing treasury ${contractId}...`, colors.yellow);
  
  const requestBody = {
    format: config.BLOCKCHAIN_FORMAT,
    accountId: process.env.ACCOUNT_ID
  };
  
  // Step 1: Get unsigned transaction from API
  const response = await gatewayClient.post(`/api/v1/treasuries/${contractId}/unpause`, requestBody);
  const unsignedTx = response.data.unsignedTx;
  
  log(`   Unsigned transaction received`, colors.cyan);
  
  // Step 2: Sign the transaction
  const signedTx = await signTransaction(unsignedTx);
  logSuccess('Unpause transaction signed successfully!');
  
  // Step 3: Publish to transaction sender
  await publishSignedTransaction(signedTx);
  logSuccess('Unpause transaction published to message queue');
  
  return response.data;
}

/**
 * Wait for treasury state to update (with retries)
 * @param {string} contractId - Treasury contract ID
 * @param {boolean} expectedPausedState - Expected paused state (true for paused, false for unpaused)
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} retryInterval - Interval between retries in milliseconds
 */
async function waitForTreasuryState(contractId, expectedPausedState, maxRetries = 12, retryInterval = 5000) {
  const stateName = expectedPausedState ? 'PAUSED' : 'UNPAUSED';
  log(`\n🔍 Waiting for treasury to be ${stateName}...`, colors.yellow);
  
  for (let i = 0; i < maxRetries; i++) {
    log(`   Attempt ${i + 1}/${maxRetries}...`);
    
    try {
      const treasury = await getTreasuryByContractId(contractId);
      
      log(`   Treasury ${contractId} paused state: ${treasury.paused}`, colors.cyan);
      
      if (treasury.paused === expectedPausedState) {
        logSuccess(`Treasury is now ${stateName}!`);
        return treasury;
      } else {
        log(`   Treasury paused=${treasury.paused}, expected=${expectedPausedState}`, colors.yellow);
      }
    } catch (err) {
      logError(`   Error fetching treasury: ${err.message}`);
    }

    await new Promise(resolve => setTimeout(resolve, retryInterval));
  }

  throw new Error(`Timeout: Treasury did not reach ${stateName} state after ${maxRetries} attempts`);
}

async function verifyTreasuryPauseUnpause(treasuryContractId) {
  logHeader('🧪 Running Treasury Pause/Unpause Verification...');

  // Validate signing configuration before starting
  if (!validateSigningConfig()) {
    logError('Signing configuration validation failed');
    process.exit(1);
  }

  try {
    let contractId;
    if (treasuryContractId)  {
      contractId = treasuryContractId;
    } else {
      // Step 1: Deploy bond, wait for treasury, and apply all roles
      log('\n1️⃣  Deploying bond, waiting for treasury, and applying roles...');
      const treasury = await deployBondWaitTreasuryAndApplyRoles();
    
      contractId = treasury.contractId;
      logSuccess(`Treasury deployed: ${contractId}`);
    }
    
    // Step 2: Verify initial state (should be unpaused)
    log('\n2️⃣  Verifying initial treasury state...');
    let treasuryDetails = await getTreasuryByContractId(contractId);
    log(`   Initial paused state: ${treasuryDetails.paused}`, colors.cyan);
    
    if (treasuryDetails.paused) {
      logError('Treasury is initially paused (expected unpaused)');
      throw new Error('Treasury initial state is incorrect');
    }
    logSuccess('Initial state verified: Treasury is unpaused');
    
    // Step 3: Pause the treasury
    log('\n3️⃣  Pausing treasury...');
    await pauseTreasury(contractId);
    
    // Step 4: Wait and verify treasury is paused
    log('\n4️⃣  Verifying treasury is paused...');
    treasuryDetails = await waitForTreasuryState(contractId, true);
    logSuccess(`Treasury ${contractId} is now paused`);
    
    // Step 5: Unpause the treasury
    log('\n5️⃣  Unpausing treasury...');
    await unpauseTreasury(contractId);
    
    // Step 6: Wait and verify treasury is unpaused
    log('\n6️⃣  Verifying treasury is unpaused...');
    treasuryDetails = await waitForTreasuryState(contractId, false);
    logSuccess(`Treasury ${contractId} is now unpaused`);
    
    logHeader('✅ Treasury Pause/Unpause Verification PASSED!');
    
  } catch (error) {
    logError(`Verification failed: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  verifyTreasuryPauseUnpause();
}

module.exports = {
  pauseTreasury,
  unpauseTreasury,
  waitForTreasuryState,
  verifyTreasuryPauseUnpause
};
