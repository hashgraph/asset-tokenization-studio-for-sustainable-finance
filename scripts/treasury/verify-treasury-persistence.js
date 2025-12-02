const { runBondCreationSimulator } = require('../ats/bond/bond-simulator');
const { gatewayClient } = require('../shared/lib/gateway-client');
const { log, logSuccess, logError, logHeader, colors } = require('../shared/lib/logger');
const { config } = require('../shared/lib/config');
const { signTransaction } = require('../shared/lib/transaction-signer');
const { publishSignedTransaction } = require('../shared/lib/infrastructure');

/**
 * Get treasury details by contract ID
 * @param {string} contractId - Treasury contract ID
 * @returns {Promise<Object>} Treasury details
 */
async function getTreasuryByContractId(contractId) {
  const response = await gatewayClient.get(`/api/v1/treasuries/${contractId}`);
  return response.data;
}

/**
 * Deploy a bond and wait for the associated treasury to be persisted
 * @returns {Promise<Object>} The created treasury object with contractId, bondContractId, createdAt, etc.
 */
async function deployBondAndWaitForTreasury(overridesBondCreationRequest = {}) {
  const startTime = new Date();
  startTime.setSeconds(startTime.getSeconds() - 5);
  log(`Start time (with buffer): ${startTime.toISOString()}`, colors.cyan);

  log('\n📝 Executing Bond Simulator...', colors.yellow);
  await runBondCreationSimulator(overridesBondCreationRequest);

  log('\n🔍 Waiting for Treasury to be persisted...', colors.yellow);
  
  const maxRetries = 12;
  const retryInterval = 5000;
  
  for (let i = 0; i < maxRetries; i++) {
    log(`   Attempt ${i + 1}/${maxRetries}...`);
    
    try {
      const response = await gatewayClient.get('/api/v1/treasuries?sortBy=createdAt&sortOrder=DESC&limit=1');
      
      const treasuries = Array.isArray(response.data) ? response.data : (response.data.items || []);
      log(`   Found ${treasuries.length} treasuries`, colors.cyan);

      if (treasuries.length > 0) {
        const latestTreasury = treasuries[0];
        const createdAt = new Date(latestTreasury.createdAt);
        
        log(`   Latest treasury: ${latestTreasury.contractId}`, colors.cyan);
        log(`   Created at: ${latestTreasury.createdAt} (parsed: ${createdAt.toISOString()})`, colors.cyan);
        log(`   Start time: ${startTime.toISOString()}`, colors.cyan);
        
        if (createdAt > startTime) {
          logSuccess('Treasury found and persisted!');
          log(`   Contract ID: ${latestTreasury.contractId}`);
          log(`   Bond Contract ID: ${latestTreasury.bondContractId}`);
          log(`   Created At: ${latestTreasury.createdAt}`);
          return latestTreasury;
        } else {
          log(`   Latest treasury is older than script start time`, colors.yellow);
        }
      }
    } catch (err) {
      logError(`   Error fetching treasuries: ${err.message}`);
    }

    await new Promise(resolve => setTimeout(resolve, retryInterval));
  }

  throw new Error('Timeout: Treasury not found after 1 minute');
}

/**
 * Apply all treasury roles to a user account
 * @param {string} treasuryContractId - Treasury contract ID
 * @param {string} userAccountId - User account ID to grant roles to
 */
async function applyTreasuryRoles(treasuryContractId, userAccountId) {
  log(`\n🔐 Applying treasury roles to ${userAccountId}...`, colors.yellow);
  
  // All treasury roles from roles.sol
  const ALL_TREASURY_ROLES = [
    '0xf8f1da56e510d0db422582238e75a932b72ae6165ad31a4c2eb993e0c9196a06', // PORTFOLIO_MANAGER_ROLE
    '0x6f65556918c1422809d0d567462eafeb371be30159d74b38ac958dc58864faeb', // PAUSER_ROLE
    '0x6b2cde3f3e0fdc0dee8b8dc6466157b675ab2b8465c45b8b9c4cf0049a93344d', // FUNDS_MANAGER_ROLE
    '0x2fa449e97717e92b32320917db3073c2407e0bc636bc1367e879e379239e26e5', // PROCEEDS_FULL_MANAGER_ROLE
    '0x096259e60fc84b10645035350be6adc907cf0cd20b1a7866e1ea9c7502a8265e', // PAYOUT_ROLE
    '0x75e1cb791887e8c7a9a1aafbb8997773bd21a9f3c83f4a70066ba5ebf7bd8ef9', // REDEMPTION_ROLE
  ];
  
  const requestBody = {
    format: config.BLOCKCHAIN_FORMAT,
    accountId: process.env.ACCOUNT_ID,
    rolesToGrant: ALL_TREASURY_ROLES,
    rolesToRevoke: []
  };
  
  // Step 1: Get unsigned transaction from API
  const response = await gatewayClient.post(
    `/api/v1/treasuries/${treasuryContractId}/users/${userAccountId}/roles`,
    requestBody
  );
  const unsignedTx = response.data.unsignedTx;
  
  log(`   Unsigned transaction received`, colors.cyan);
  
  // Step 2: Sign the transaction
  const signedTx = await signTransaction(unsignedTx);
  logSuccess('Role assignment transaction signed successfully!');
  
  // Step 3: Publish to transaction sender
  await publishSignedTransaction(signedTx);
  logSuccess('Role assignment transaction published to message queue');
  
  log(`   Granted ${ALL_TREASURY_ROLES.length} roles to ${userAccountId}`, colors.green);
  
  return response.data;
}

/**
 * Deploy a bond, wait for treasury, and apply all roles to the signing account
 * @returns {Promise<Object>} The created treasury object with contractId, bondContractId, createdAt, etc.
 */
async function deployBondWaitTreasuryAndApplyRoles(paymentTokenContractId, overridesBondCreationRequest = {}) {
  const treasury = await deployBondAndWaitForTreasury(overridesBondCreationRequest);
  
  log(`\n📋 Applying all treasury roles to signing account...`, colors.bright);
  await applyTreasuryRoles(treasury.contractId, process.env.ACCOUNT_ID);
  
  logSuccess('All roles applied successfully!');
  
  return treasury;
}

async function verifyTreasuryPersistence() {
  logHeader('🧪 Running Treasury Persistence Verification...');

  try {
    await deployBondAndWaitForTreasury();
  } catch (error) {
    logError(`Verification failed: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  verifyTreasuryPersistence();
}

module.exports = {
  getTreasuryByContractId,
  deployBondAndWaitForTreasury,
  applyTreasuryRoles,
  deployBondWaitTreasuryAndApplyRoles,
  verifyTreasuryPersistence
};
