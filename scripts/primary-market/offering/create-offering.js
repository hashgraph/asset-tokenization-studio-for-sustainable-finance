const { gatewayClient } = require('../../shared/lib/gateway-client');
const { logSuccess, logError, logInfo, log, colors, logHeader } = require('../../shared/lib/logger');
const { signTransaction, validateSigningConfig } = require('../../shared/lib/transaction-signer');
const { publishSignedTransaction } = require('../../shared/lib/infrastructure');
const { config } = require('../../shared/lib/config');
const { RESOLVER_CONTRACT_ID, CONFIG_VERSION } = require('../shared/test-config');
const { deployAndWaitForPrimaryMarket, grantOfferingCreatorRoleAndWait } = require('../shared/setup-service');
const { grantOfferingCreatorRole, OFFERING_CREATOR_ROLE } = require('../shared/role-service');
const { createOffering: createOfferingService } = require('./offering-service');
const { deployPrimaryMarket } = require('../primarymarket/deploy-primary-market');
const { waitForPrimaryMarketDeployment, waitForUserRoleUpdate } = require('../primarymarket/get-latest-primary-market');

/**
 * Create an offering in a Primary Market (wrapper for offering-service)
 * @param {string} format - The blockchain format (hedera or ethereum)
 * @param {string} marketContractId - The primary market contract ID
 * @param {string} bondContractId - The bond contract ID
 * @param {Object} offeringParams - The offering parameters
 * @returns {Promise<Object>} The create offering transaction details
 */
async function createOffering(format, marketContractId, bondContractId, offeringParams) {
  return await createOfferingService(format, marketContractId, bondContractId, offeringParams);
}

/**
 * Get the latest offering from the database
 * @param {string} marketContractId - The primary market contract ID
 * @param {string} bondContractId - The bond contract ID
 * @returns {Promise<Object|null>} The latest offering or null if not found
 */
async function getLatestOffering(marketContractId, bondContractId) {
  log(`\n🔍 Fetching latest offering...`, colors.bright);

  try {
    const response = await gatewayClient.get(`/api/v1/primary-markets/${marketContractId}/bonds/${bondContractId}/offerings`, {
      params: {
        page: 1,
        limit: 1,
        orderBy: 'createdAt',
        order: 'desc'
      }
    });

    if (response.data?.items && response.data.items.length > 0) {
      const latestOffering = response.data.items[0];
      logSuccess(`Found latest offering: ID ${latestOffering.id}`);
      logInfo(`Bond Contract ID: ${latestOffering.bondContractId}`);
      logInfo(`Created at: ${latestOffering.createdAt}`);
      return latestOffering;
    } else {
      logError('No offerings found in the system');
      return null;
    }
  } catch (error) {
    logError(`Failed to fetch offerings: ${error.message}`);
    if (error.response?.data) {
      logError(`Error details: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    throw error;
  }
}

/**
 * Wait for the offering to be created by polling the database
 * @param {string} marketContractId - The primary market contract ID
 * @param {string} bondContractId - The bond contract ID
 * @param {number} initialWaitMs - Initial wait time in milliseconds before querying (default: 15000)
 * @returns {Promise<Object>} The created offering
 */
async function waitForOfferingCreation(marketContractId, bondContractId, initialWaitMs = 15000) {
  logInfo(`⏳ Waiting ${initialWaitMs/1000} seconds for transaction to be processed...`);

  // Initial wait to allow transaction to be processed
  await new Promise(resolve => setTimeout(resolve, initialWaitMs));

  logInfo(`🔍 Fetching latest offering from database...`);
  const latestOffering = await getLatestOffering(marketContractId, bondContractId);

  if (!latestOffering) {
    throw new Error('No offering found in database after creation');
  }

  return latestOffering;
}

/**
 * Main execution function
 */
async function main() {
  try {
    logHeader('🚀 CREATE OFFERING SCRIPT');
    log('=====================================\n', colors.cyan);

    // Validate configuration
    if (!validateSigningConfig()) {
      process.exit(1);
    }

    if (!process.env.ACCOUNT_ID) {
      logError('ACCOUNT_ID not found in environment variables');
      logInfo('Please set ACCOUNT_ID in your .env file');
      process.exit(1);
    }

    // Get format from environment
    const format = config.BLOCKCHAIN_FORMAT.toLowerCase();
    logInfo(`Using ${format.toUpperCase()} blockchain format`);

    // Hardcoded configuration parameters
    const resolverContractId = RESOLVER_CONTRACT_ID;
    const configVersion = CONFIG_VERSION;
    const bondContractId = '0.0.7319744'; // TODO: Set bond contract ID
    const userAccountId = process.env.ACCOUNT_ID;

    // Hardcoded offering parameters
    const offeringParams = {
      treasuryContractId: '0.0.12345',
      paymentTokenContractId: '0.0.7352585',
      lotSize: '1000',
      minLots: '1',
      maxLots: '10000',
      targetLots: '5000',
      targetQuantityRule: 0, // 0: AT_LEAST, 1: AT_MOST, 2: BETWEEN
      startDate: new Date(Date.now() + 60000), // 1 minute from now
      endDate: new Date(Date.now() + 86400000 * 30), // 30 days from now
      deadlineRule: 0, // 0: SOFT, 1: HARD
      price: '100',
      priceDecimals: 2
    };

    if (!bondContractId) {
      logError('Bond Contract ID is not set in the script');
      logInfo('Please update the bondContractId variable in create-offering.js');
      process.exit(1);
    }

    logInfo(`Resolver Contract ID: ${resolverContractId}`);
    logInfo(`Config Version: ${configVersion}`);
    logInfo(`Bond Contract ID: ${bondContractId}`);
    logInfo(`User Account ID: ${userAccountId}`);
    log('');

    // ============================================
    // Step 1: Deploy Primary Market
    // ============================================
    logHeader('Step 1: Deploy Primary Market');
    const deploymentTx = await deployPrimaryMarket(format, resolverContractId, configVersion);

    logHeader('🔐 Signing deployment transaction...');
    const signedDeploymentTx = await signTransaction(deploymentTx.unsignedTx);
    logSuccess('Deployment transaction signed successfully!');

    await publishSignedTransaction(signedDeploymentTx, {
      description: 'Deploy Primary Market',
      resolverContractId: resolverContractId,
      configVersion: configVersion
    });

    // Wait for deployment and get the contract ID from the database
    const deployedMarket = await waitForPrimaryMarketDeployment();
    const marketContractId = deployedMarket.contractId;

    logSuccess(`✅ Primary Market deployed: ${marketContractId}`);
    log('');

    // ============================================
    // Step 2: Grant OFFERING_CREATOR_ROLE
    // ============================================
    logHeader('Step 2: Grant OFFERING_CREATOR_ROLE');
    const grantRoleTx = await grantOfferingCreatorRole(format, marketContractId, userAccountId);

    logHeader('🔐 Signing grant role transaction...');
    const signedGrantRoleTx = await signTransaction(grantRoleTx.unsignedTx);
    logSuccess('Grant role transaction signed successfully!');

    await publishSignedTransaction(signedGrantRoleTx, {
      description: 'Grant OFFERING_CREATOR_ROLE',
      marketContractId: marketContractId,
      userAccountId: userAccountId,
      roleId: OFFERING_CREATOR_ROLE
    });

    // Verify role was granted
    await waitForUserRoleUpdate(marketContractId, OFFERING_CREATOR_ROLE, userAccountId, true);
    logSuccess(`✅ OFFERING_CREATOR_ROLE granted to ${userAccountId}`);
    log('');

    // ============================================
    // Step 3: Create Offering
    // ============================================
    logHeader('Step 3: Create Offering');
    const createOfferingTx = await createOffering(format, marketContractId, bondContractId, offeringParams);

    logHeader('🔐 Signing create offering transaction...');
    const signedCreateOfferingTx = await signTransaction(createOfferingTx.unsignedTx);
    logSuccess('Create offering transaction signed successfully!');

    await publishSignedTransaction(signedCreateOfferingTx, {
      description: 'Create Offering',
      marketContractId: marketContractId,
      bondContractId: bondContractId,
      lotSize: offeringParams.lotSize,
      targetLots: offeringParams.targetLots,
      price: offeringParams.price,
      priceDecimals: offeringParams.priceDecimals
    });

    // Wait for offering to be created and get the offering ID
    const createdOffering = await waitForOfferingCreation(marketContractId, bondContractId);
    const offeringId = createdOffering.id;

    logSuccess(`✅ Offering created: ID ${offeringId}`);
    log('');

    // ============================================
    // Summary
    // ============================================
    logHeader('✨ CREATE OFFERING COMPLETED!');
    log('=====================================', colors.green);
    log(`Primary Market ID: ${marketContractId}`, colors.green);
    log(`Offering ID: ${offeringId}`, colors.green);
    log(`Bond Contract ID: ${bondContractId}`, colors.green);
    log('', colors.green);
    log('Offering Details:', colors.cyan);
    log(`  • Lot Size: ${createdOffering.lotSize}`, colors.green);
    log(`  • Min Lots: ${createdOffering.minLots}`, colors.green);
    log(`  • Max Lots: ${createdOffering.maxLots}`, colors.green);
    log(`  • Target Lots: ${createdOffering.targetLots}`, colors.green);
    log(`  • Price: ${createdOffering.price} (${createdOffering.priceDecimals} decimals)`, colors.green);
    log(`  • Start Date: ${createdOffering.startDate}`, colors.green);
    log(`  • End Date: ${createdOffering.endDate}`, colors.green);
    log('\nThe offering has been successfully created!\n', colors.green);

  } catch (error) {
    logError(`Script execution failed: ${error.message}`);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  createOffering,
  waitForOfferingCreation,
  getLatestOffering
};
