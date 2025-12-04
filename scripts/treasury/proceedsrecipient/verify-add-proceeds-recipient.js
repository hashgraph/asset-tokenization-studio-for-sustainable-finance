const { gatewayClient } = require('../../shared/lib/gateway-client');
const { deployBondWaitTreasuryAndApplyRoles } = require('../verify-treasury-persistence');
const { log, logSuccess, logError, logInfo, logHeader, colors } = require('../../shared/lib/logger');
const { config } = require('../../shared/lib/config');
const { signTransaction, validateSigningConfig } = require('../../shared/lib/transaction-signer');
const { publishSignedTransaction } = require('../../shared/lib/infrastructure');

/**
 * Grant a certain ATS role to a certain account
 * @param {string} bondContractId - Bond contract ID
 * @param {string} roleId - The role to be granted
 * @param {string} userAccountId - The account to which the role will be granted
 */
async function grantProceedRecipientManagerRole(bondContractId, roleId, userAccountId) {
  log(`\n🔐 Granting ${roleId} role to account ${userAccountId}...`, colors.yellow);

  const requestBody = {
    format: config.BLOCKCHAIN_FORMAT,
    accountId: process.env.ACCOUNT_ID,
  };

  // Step 1: Get unsigned transaction from API
  const response = await gatewayClient.post(
    `/api/v1/ats/bonds/${bondContractId}/roles/${roleId}/users/${userAccountId}`,
    requestBody
  );
  const unsignedTx = response.data.unsignedTx;

  log(`   Unsigned transaction received`, colors.cyan);

  // Step 2: Sign the transaction
  const signedTx = await signTransaction(unsignedTx);
  logSuccess('Granting role transaction signed successfully!');

  // Step 3: Publish to transaction sender
  await publishSignedTransaction(signedTx);
  logSuccess('Granting role transaction published to message queue');

  return response.data;
}

/**
 * Adds a proceeds recipient for a bond (with retries)
 * @param {string} bondContractId - Bond contract ID
 * @param {string} proceedsRecipientAddress - The address of the proceeds recipient to be added
 */
async function addProceedsRecipient(bondContractId, proceedsRecipientAddress) {
  log(`\n💱 Adding proceeds recipient for bond ${bondContractId}...`, colors.yellow);

  const requestBody = {
    format: config.BLOCKCHAIN_FORMAT,
    accountId: process.env.ACCOUNT_ID,
    proceedRecipientAddress: proceedsRecipientAddress
  };

  // Step 1: Get unsigned transaction from API
  const response = await gatewayClient.post(
    `/api/v1/ats/bonds/${bondContractId}/proceeds-recipients`,
    requestBody
  );
  const unsignedTx = response.data.unsignedTx;

  log(`   Unsigned transaction received`, colors.cyan);

  // Step 2: Sign the transaction
  const signedTx = await signTransaction(unsignedTx);
  logSuccess('Creating a proceeds recipient transaction signed successfully!');

  // Step 3: Publish to transaction sender
  await publishSignedTransaction(signedTx);
  logSuccess('Creating a proceeds recipient transaction published to message queue');

  return proceedsRecipientAddress;
}

/**
 * Wait for proceeds recipient added (with retries)
 * @param {string} bondContractId - Bond contract ID
 * @param {string} proceedsRecipient - The proceeds recipient to be added
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} retryInterval - Interval between retries in milliseconds
 */
async function waitForProceedsRecipientAdded(bondContractId, proceedsRecipient, maxRetries = 12, retryInterval = 5000) {
  log(`\n🔍 Waiting for the proceeds recipient to be added...`, colors.yellow);

  for (let i = 0; i < maxRetries; i++) {
    log(`   Attempt ${i + 1}/${maxRetries}...`);

    try {
      const response = await gatewayClient.get(`/api/v1/ats/bonds/${bondContractId}/proceeds-recipients`);
      if (response.data && response.data.total > 0) {
        const items = response.data.items;
        log(`   Found ${items.length} proceeds recipient(s)`, colors.cyan);
        for (let j = 0; j < items.length; j++) {
          const proceedsRecipientItem = items[j];
          log(`   Checking proceeds recipient: ${proceedsRecipientItem.proceedRecipientAddress}`, colors.cyan);
          if (proceedsRecipientItem.proceedRecipientAddress.toLowerCase() === proceedsRecipient.toLowerCase()) {
            logSuccess(`Proceeds recipient found: ${proceedsRecipientItem.proceedRecipientAddress}`);
            return;
          }
        }
        log(`   Proceeds recipient ${proceedsRecipient} not found in the list`, colors.yellow);
      } else {
        logInfo("Proceeds recipient not yet added for the Bond");
      }
    } catch (err) {
      logError(`   Error fetching the proceeds recipient: ${err.message}`);
    }

    await new Promise(resolve => setTimeout(resolve, retryInterval));
  }

  throw new Error(`Timeout: Proceeds recipient was not added after ${maxRetries} attempts`);
}

async function verifyAddProceedsRecipient(bondContractId) {
  logHeader('🧪 Running verification of the execution to add a proceeds recipient...');

  // Validate signing configuration before starting
  if (!validateSigningConfig()) {
    logError('Signing configuration validation failed');
    process.exit(1);
  }

 let contractId;

  try {
    if (bondContractId)  {
      contractId = bondContractId;
    } else {
      // Step 2: Deploy bond, wait for treasury, and apply all roles
      log('\n1️⃣  Deploying bond, waiting for treasury, and applying roles...');
      const treasury = await deployBondWaitTreasuryAndApplyRoles();

      contractId = treasury.bondContractId;
      logSuccess(`Bond deployed: ${contractId}`);
    }

    // Step 1: Grant PROCEED_RECIPIENT_MANAGER_ROLE role to the account
    const proceedRecipientManagerRoleId = "0xebc53fe99fea28c7aa9476a714959af5b931f34a8a8734365ec63113198d512f";
    await grantProceedRecipientManagerRole(contractId, proceedRecipientManagerRoleId, process.env.ACCOUNT_ID);

    // Step 6: Creates a proceeds recipient
    log('\n3️⃣  Creating the proceeds recipient...');
    const proceedsRecipient = process.env.ACCOUNT_ID;
    const proceedRecipientAddress = process.env.ACCOUNT_EVM_ADDRESS;
    const proceedsRecipientAddress = await addProceedsRecipient(contractId, proceedRecipientAddress);

    // Step 8: Wait and verify proceed recipient was added
    log('\n4️⃣  Verifying proceeds recipient added...');
    await waitForProceedsRecipientAdded(contractId, proceedsRecipientAddress);

    logSuccess(`Proceeds recipient successfully added!`);

    logHeader('✅ Proceeds Recipient adding Verification PASSED!');

    return proceedsRecipient;

  } catch (error) {
    logError(`Verification failed: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  verifyAddProceedsRecipient();
}

module.exports = {
  verifyAddProceedsRecipient,
  addProceedsRecipient,
  waitForProceedsRecipientAdded
};
