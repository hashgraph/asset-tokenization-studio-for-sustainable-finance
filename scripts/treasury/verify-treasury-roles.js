const { deployBondAndWaitForTreasury } = require('./verify-treasury-persistence');
const { gatewayClient } = require('../shared/lib/gateway-client');
const { log, logSuccess, logError, logHeader, colors } = require('../shared/lib/logger');
const { config } = require('../shared/lib/config');
const { signTransaction, validateSigningConfig } = require('../shared/lib/transaction-signer');
const { publishSignedTransaction } = require('../shared/lib/infrastructure');

// Role Constants
const ROLES = {
  PORTFOLIO_MANAGER_ROLE: '0xf8f1da56e510d0db422582238e75a932b72ae6165ad31a4c2eb993e0c9196a06',
  PAUSER_ROLE: '0x6f65556918c1422809d0d567462eafeb371be30159d74b38ac958dc58864faeb',
  FUNDS_MANAGER_ROLE: '0x6b2cde3f3e0fdc0dee8b8dc6466157b675ab2b8465c45b8b9c4cf0049a93344d',
  PROCEEDS_FULL_MANAGER_ROLE: '0x2fa449e97717e92b32320917db3073c2407e0bc636bc1367e879e379239e26e5',
  PAYOUT_ROLE: '0x096259e60fc84b10645035350be6adc907cf0cd20b1a7866e1ea9c7502a8265e',
  REDEMPTION_ROLE: '0x75e1cb791887e8c7a9a1aafbb8997773bd21a9f3c83f4a70066ba5ebf7bd8ef9',
};

/**
 * Grant a specific role to a user
 */
async function grantTreasuryRole(treasuryId, roleId, userId) {
  log(`\n🔑 Granting role ${roleId} to ${userId}...`, colors.yellow);

  const requestBody = {
    format: config.BLOCKCHAIN_FORMAT,
    accountId: process.env.ACCOUNT_ID
  };

  // Step 1: Get unsigned transaction
  const response = await gatewayClient.post(
    `/api/v1/treasuries/${treasuryId}/roles/${roleId}/users/${userId}`,
    requestBody
  );
  const unsignedTx = response.data.unsignedTx;
  log(`   Unsigned transaction received`, colors.cyan);

  // Step 2: Sign
  const signedTx = await signTransaction(unsignedTx);
  logSuccess('Grant Role transaction signed successfully!');

  // Step 3: Publish
  await publishSignedTransaction(signedTx);
  logSuccess('Grant Role transaction published to message queue');

  return response.data;
}

/**
 * Revoke a specific role from a user
 */
async function revokeTreasuryRole(treasuryId, roleId, userId) {
  log(`\n🚫 Revoking role ${roleId} from ${userId}...`, colors.yellow);

  const requestBody = {
    format: config.BLOCKCHAIN_FORMAT,
    accountId: process.env.ACCOUNT_ID
  };

  // Step 1: Get unsigned transaction (using DELETE method but with body for accountId/format if needed, or query params? 
  // Usually DELETE with body is discouraged but depends on API implementation. 
  // Assuming the API expects a DELETE request to generate the transaction.
  // Note: axios.delete second argument is config, so data goes in config.data
  const response = await gatewayClient.delete(
    `/api/v1/treasuries/${treasuryId}/roles/${roleId}/users/${userId}`,
    { data: requestBody }
  );
  const unsignedTx = response.data.unsignedTx;
  log(`   Unsigned transaction received`, colors.cyan);

  // Step 2: Sign
  const signedTx = await signTransaction(unsignedTx);
  logSuccess('Revoke Role transaction signed successfully!');

  // Step 3: Publish
  await publishSignedTransaction(signedTx);
  logSuccess('Revoke Role transaction published to message queue');

  return response.data;
}

/**
 * Grant multiple roles to a user (Batch)
 */
async function grantTreasuryRolesBatch(treasuryId, userId, rolesToGrant) {
  log(`\n🔑 Granting batch roles to ${userId}...`, colors.yellow);
  log(`   Roles: ${JSON.stringify(rolesToGrant)}`, colors.cyan);

  const requestBody = {
    format: config.BLOCKCHAIN_FORMAT,
    accountId: process.env.ACCOUNT_ID,
    rolesToGrant: rolesToGrant,
    rolesToRevoke: []
  };

  // Step 1: Get unsigned transaction
  const response = await gatewayClient.post(
    `/api/v1/treasuries/${treasuryId}/users/${userId}/roles`,
    requestBody
  );
  const unsignedTx = response.data.unsignedTx;
  log(`   Unsigned transaction received`, colors.cyan);

  // Step 2: Sign
  const signedTx = await signTransaction(unsignedTx);
  logSuccess('Batch Grant Roles transaction signed successfully!');

  // Step 3: Publish
  await publishSignedTransaction(signedTx);
  logSuccess('Batch Grant Roles transaction published to message queue');

  return response.data;
}

/**
 * Revoke multiple roles from a user (Batch)
 */
async function revokeTreasuryRolesBatch(treasuryId, userId, rolesToRevoke) {
  log(`\n🚫 Revoking batch roles from ${userId}...`, colors.yellow);
  log(`   Roles: ${JSON.stringify(rolesToRevoke)}`, colors.cyan);

  const requestBody = {
    format: config.BLOCKCHAIN_FORMAT,
    accountId: process.env.ACCOUNT_ID,
    rolesToGrant: [],
    rolesToRevoke: rolesToRevoke
  };

  // Step 1: Get unsigned transaction
  const response = await gatewayClient.post(
    `/api/v1/treasuries/${treasuryId}/users/${userId}/roles`,
    requestBody
  );
  const unsignedTx = response.data.unsignedTx;
  log(`   Unsigned transaction received`, colors.cyan);

  // Step 2: Sign
  const signedTx = await signTransaction(unsignedTx);
  logSuccess('Batch Revoke Roles transaction signed successfully!');

  // Step 3: Publish
  await publishSignedTransaction(signedTx);
  logSuccess('Batch Revoke Roles transaction published to message queue');

  return response.data;
}

/**
 * Verify that a user has a specific role
 */
async function verifyRoleMember(treasuryId, roleId, userId, shouldHaveRole = true, maxRetries = 12, retryInterval = 5000) {
  const action = shouldHaveRole ? "has" : "does not have";
  log(`\n🔍 Verifying user ${userId} ${action} role ${roleId}...`, colors.yellow);

  for (let i = 0; i < maxRetries; i++) {
    log(`   Attempt ${i + 1}/${maxRetries}...`);

    try {
      const response = await gatewayClient.get(`/api/v1/treasuries/${treasuryId}/roles/${roleId}/members`);
      const members = response.data.items || response.data || [];
      
      const hasRole = members.some(member => 
        typeof member === 'string' ? member === userId : member.userAccountId === userId
      );
      log(`   Current members: ${JSON.stringify(members)}`, colors.cyan);

      if (hasRole === shouldHaveRole) {
        logSuccess(`Verification successful: User ${userId} ${action} role ${roleId}!`);
        return true;
      }
    } catch (err) {
      logError(`   Error fetching role members: ${err.message}`);
    }

    await new Promise(resolve => setTimeout(resolve, retryInterval));
  }

  throw new Error(`Timeout: Verification failed for user ${userId} ${action} role ${roleId} after ${maxRetries} attempts`);
}

/**
 * Verify that a user has a list of roles
 */
async function verifyUserRoles(treasuryId, userId, expectedRoles, shouldHaveRoles = true, maxRetries = 12, retryInterval = 5000) {
  const action = shouldHaveRoles ? "has" : "does not have";
  log(`\n🔍 Verifying user ${userId} ${action} roles: ${JSON.stringify(expectedRoles)}...`, colors.yellow);

  for (let i = 0; i < maxRetries; i++) {
    log(`   Attempt ${i + 1}/${maxRetries}...`);

    try {
      const response = await gatewayClient.get(`/api/v1/treasuries/${treasuryId}/users/${userId}/roles`);
      const userRoles = response.data.items || response.data || [];
      
      log(`   Current user roles: ${JSON.stringify(userRoles)}`, colors.cyan);

      const normalizedRoles = userRoles.map(role => 
        typeof role === 'string' ? role : role.roleId
      );

      let conditionMet;
      if (shouldHaveRoles) {
        conditionMet = expectedRoles.every(role => normalizedRoles.includes(role));
      } else {
        conditionMet = expectedRoles.every(role => !normalizedRoles.includes(role));
      }

      if (conditionMet) {
        logSuccess(`Verification successful: User ${userId} ${action} expected roles!`);
        return true;
      }
    } catch (err) {
      logError(`   Error fetching user roles: ${err.message}`);
    }

    await new Promise(resolve => setTimeout(resolve, retryInterval));
  }

  throw new Error(`Timeout: Verification failed for user ${userId} ${action} roles after ${maxRetries} attempts`);
}

async function verifyTreasuryRoles() {
  logHeader('🧪 Running Treasury Roles Verification...');

  if (!validateSigningConfig()) {
    logError('Signing configuration validation failed');
    process.exit(1);
  }

  try {
    // 1. Deploy Treasury
    log('\n1️⃣  Deploying bond and waiting for treasury...');
    const treasury = await deployBondAndWaitForTreasury();
    const treasuryId = treasury.contractId;
    const userId = process.env.ACCOUNT_ID;

    logSuccess(`Treasury deployed: ${treasuryId}`);

    // 2. Test Single Role Grant (PAUSER_ROLE)
    log('\n2️⃣  Testing Single Role Grant (PAUSER_ROLE)...');
    await grantTreasuryRole(treasuryId, ROLES.PAUSER_ROLE, userId);
    await verifyRoleMember(treasuryId, ROLES.PAUSER_ROLE, userId, true);

    // 3. Test Single Role Revoke (PAUSER_ROLE)
    log('\n3️⃣  Testing Single Role Revoke (PAUSER_ROLE)...');
    await revokeTreasuryRole(treasuryId, ROLES.PAUSER_ROLE, userId);
    await verifyRoleMember(treasuryId, ROLES.PAUSER_ROLE, userId, false);

    // 4. Test Batch Role Grant (FUNDS_MANAGER + PAYOUT)
    log('\n4️⃣  Testing Batch Role Grant (FUNDS_MANAGER + PAYOUT)...');
    const batchRoles = [ROLES.FUNDS_MANAGER_ROLE, ROLES.PAYOUT_ROLE];
    await grantTreasuryRolesBatch(treasuryId, userId, batchRoles);
    await verifyUserRoles(treasuryId, userId, batchRoles, true);

    // 5. Test Batch Role Revoke (FUNDS_MANAGER + PAYOUT)
    log('\n5️⃣  Testing Batch Role Revoke (FUNDS_MANAGER + PAYOUT)...');
    await revokeTreasuryRolesBatch(treasuryId, userId, batchRoles);
    await verifyUserRoles(treasuryId, userId, batchRoles, false);

    logHeader('✅ Treasury Roles Verification PASSED!');

  } catch (error) {
    logError(`Verification failed: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  verifyTreasuryRoles();
}

module.exports = {
  verifyTreasuryRoles
};
