const { config } = require('../../shared/lib/config');
const { log, logSuccess, logError, logHeader, logWarning, colors } = require('../../shared/lib/logger');
const { signTransaction, validateSigningConfig } = require('../../shared/lib/transaction-signer');
const { publishSignedTransaction } = require('../../shared/lib/infrastructure');
const { getUserInput } = require('../../shared/lib/input');
const {
  prepareSettlementData,
  executeOfferingSettlement,
  fetchAllSubscriptions,
  analyzeSubscriptionsForSettlement
} = require('./settlement-service');

/**
 * Interactive mode - prompts user for settlement details
 */
async function runInteractiveSettlement() {
  const format = config.BLOCKCHAIN_FORMAT.toLowerCase();

  // Prompt for required information
  log('\n📝 Please provide the following information:', colors.bright);
  const marketContractId = await getUserInput('Market Contract ID (e.g., 0.0.1234567): ');
  const offeringIdInput = await getUserInput('Offering ID (e.g., 1): ');
  const offeringId = parseInt(offeringIdInput);

  if (!marketContractId || !offeringId) {
    logError('Market Contract ID and Offering ID are required!');
    return;
  }

  // Fetch and analyze subscriptions
  const allSubscriptions = await fetchAllSubscriptions(marketContractId, offeringId);

  if (allSubscriptions.length === 0) {
    logError('No subscriptions found for this offering!');
    return;
  }

  const categorized = analyzeSubscriptionsForSettlement(allSubscriptions);

  // Ask settlement strategy
  log('\n🎯 Settlement Strategy:', colors.bright);
  log('1. Auto-settle all SUBMITTED subscriptions as SUCCESS');
  log('2. Manual selection (specify success/fail IDs)');
  log('3. Dry run (view data only, no transaction)');

  const strategy = await getUserInput('Choose strategy (1/2/3): ');

  if (strategy === '3') {
    logSuccess('Dry run completed. No transaction created.');
    return;
  }

  let settlementData;

  if (strategy === '1') {
    // Auto-settle submitted as success
    settlementData = await prepareSettlementData(marketContractId, offeringId, {
      autoSelectSuccess: true
    });
  } else if (strategy === '2') {
    // Manual selection
    log('\n📋 Available subscription IDs:', colors.bright);
    allSubscriptions.forEach(sub => {
      log(`  ID: ${sub.id}, Status: ${sub.status}, Investor: ${sub.investorAccountId}, Lots: ${sub.lotUnits}`);
    });

    const successIdsInput = await getUserInput('Enter SUCCESS subscription IDs (comma-separated, or press Enter for none): ');
    const failIdsInput = await getUserInput('Enter FAILED subscription IDs (comma-separated, or press Enter for none): ');

    const successIds = successIdsInput ? successIdsInput.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id)) : [];
    const failIds = failIdsInput ? failIdsInput.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id)) : [];

    settlementData = await prepareSettlementData(marketContractId, offeringId, {
      autoSelectSuccess: false,
      manualSuccessIds: successIds,
      manualFailIds: failIds
    });
  } else {
    logError('Invalid strategy selected!');
    return;
  }

  if (settlementData.totalToSettle === 0) {
    logWarning('No subscriptions selected for settlement!');
    return;
  }

  // Confirm before proceeding
  log('\n⚠️  CONFIRMATION:', colors.bright);
  log(`You are about to settle ${settlementData.totalToSettle} subscriptions:`);
  log(`  • Success: ${settlementData.successIds.length}`);
  log(`  • Failed: ${settlementData.failIds.length}`);

  const confirm = await getUserInput('Proceed with settlement? (yes/no): ');

  if (confirm.toLowerCase() !== 'yes') {
    logWarning('Settlement cancelled by user.');
    return;
  }

  // Execute settlement
  const settlement = await executeOfferingSettlement(
    format,
    marketContractId,
    offeringId,
    settlementData.successIds,
    settlementData.failIds,
    settlementData.start,
    settlementData.end
  );

  // Sign and publish transaction
  try {
    const signedTx = await signTransaction(settlement.unsignedTx);

    logSuccess(`${format.toUpperCase()} settlement transaction signed successfully!`);

    await publishSignedTransaction(signedTx);

    logHeader('🎉 Offering Settlement Completed!');
    logSuccess(`Settled ${settlementData.totalToSettle} subscriptions`);
    logSuccess(`Success: ${settlementData.successIds.length}, Failed: ${settlementData.failIds.length}`);
    logSuccess('Published signed transaction to message queue');

  } catch (error) {
    logError(`Failed to sign settlement transaction: ${error.message}`);
    logError('Make sure:');
    logError('   • Private key in .env file is valid for the selected blockchain format');
    logError('   • For Hedera: HEDERA_PRIVATE_KEY should be in DER format');
    logError('   • For Ethereum: ETHEREUM_PRIVATE_KEY should be in hex format');
  }
}

/**
 * Automated mode - uses provided parameters
 */
async function runAutomatedSettlement(marketContractId, offeringId, successIds = [], failIds = [], autoSelectSuccess = true) {
  const format = config.BLOCKCHAIN_FORMAT.toLowerCase();

  logHeader('🤖 Running Automated Settlement...');

  const settlementData = await prepareSettlementData(marketContractId, offeringId, {
    autoSelectSuccess,
    manualSuccessIds: successIds,
    manualFailIds: failIds
  });

  if (settlementData.totalToSettle === 0) {
    logWarning('No subscriptions selected for settlement!');
    return;
  }

  const settlement = await executeOfferingSettlement(
    format,
    marketContractId,
    offeringId,
    settlementData.successIds,
    settlementData.failIds,
    settlementData.start,
    settlementData.end
  );

  try {
    const signedTx = await signTransaction(settlement.unsignedTx);

    logSuccess(`${format.toUpperCase()} settlement transaction signed successfully!`);

    await publishSignedTransaction(signedTx);

    logHeader('🎉 Automated Settlement Completed!');
    logSuccess(`Settled ${settlementData.totalToSettle} subscriptions`);
    logSuccess(`Success: ${settlementData.successIds.length}, Failed: ${settlementData.failIds.length}`);
    logSuccess('Published signed transaction to message queue');

    return settlement;

  } catch (error) {
    logError(`Failed to sign settlement transaction: ${error.message}`);
    throw error;
  }
}

async function main() {
  try {
    logHeader('💰 Evercity Offering Settlement Simulator');
    log('==========================================\n', colors.bright);
    log(`📡 Blockchain Format: ${config.BLOCKCHAIN_FORMAT.toUpperCase()}`, colors.blue);

    if (!validateSigningConfig()) {
      return;
    }

    // Check if running in automated mode (with CLI args)
    const args = process.argv.slice(2);

    if (args.length >= 2) {
      // Automated mode: node settlement-simulator.js <marketId> <offeringId> [successIds] [failIds]
      const marketContractId = args[0];
      const offeringId = parseInt(args[1]);
      const successIds = args[2] ? args[2].split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id)) : [];
      const failIds = args[3] ? args[3].split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id)) : [];
      const autoSelectSuccess = successIds.length === 0 && failIds.length === 0;

      await runAutomatedSettlement(marketContractId, offeringId, successIds, failIds, autoSelectSuccess);
    } else {
      // Interactive mode
      await runInteractiveSettlement();
    }

  } catch (error) {
    logError(`Settlement simulation failed: ${error.message}`);
    if (error.stack) {
      logError(error.stack);
    }
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { runInteractiveSettlement, runAutomatedSettlement };
