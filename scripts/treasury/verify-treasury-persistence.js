const { runBondCreationSimulator } = require('../ats/bond/bond-simulator');
const { gatewayClient } = require('../shared/lib/gateway-client');
const { log, logSuccess, logError, logHeader, colors } = require('../shared/lib/logger');

async function verifyTreasuryPersistence() {
  logHeader('🧪 Running Treasury Persistence Verification...');

  const startTime = new Date();
  // Subtract a small buffer to account for clock skew or processing time
  startTime.setSeconds(startTime.getSeconds() - 5);
  
  log(`Start time (with buffer): ${startTime.toISOString()}`, colors.cyan);

  try {
    // 1. Run the bond simulator to deploy a bond (and treasury)
    log('\n1. Executing Bond Simulator...', colors.yellow);
    await runBondCreationSimulator();

    // 2. Poll getTreasuries to verify persistence
    log('\n2. Verifying Treasury Persistence...', colors.yellow);
    
    const maxRetries = 12; // 1 minute (12 * 5s)
    const retryInterval = 5000;
    
    for (let i = 0; i < maxRetries; i++) {
      log(`   Attempt ${i + 1}/${maxRetries}...`);
      
      try {
        const response = await gatewayClient.get('/api/v1/treasuries');
        // Handle both paginated and non-paginated responses just in case
        const treasuries = Array.isArray(response.data) ? response.data : (response.data.data || []);

        // Find a treasury created after start time
        const newTreasury = treasuries.find(t => new Date(t.createdAt) > startTime);

        if (newTreasury) {
          logSuccess('Treasury found!');
          log(`   Contract ID: ${newTreasury.contractId}`);
          log(`   Bond Contract ID: ${newTreasury.bondContractId}`);
          log(`   Created At: ${newTreasury.createdAt}`);
          return;
        }
      } catch (err) {
        logError(`   Error fetching treasuries: ${err.message}`);
      }

      await new Promise(resolve => setTimeout(resolve, retryInterval));
    }

    throw new Error('Timeout: Treasury not found after 1 minute');

  } catch (error) {
    logError(`Verification failed: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  verifyTreasuryPersistence();
}
