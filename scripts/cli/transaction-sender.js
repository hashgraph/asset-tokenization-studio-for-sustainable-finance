const { config } = require('../lib/config');
const { log, logSuccess, logError, logHeader, colors } = require('../lib/logger');
const { signTransaction, validateSigningConfig } = require('../lib/transaction-signer');
const { publishSignedTransaction} = require('../lib/infrastructure');
const { getUserInput } = require('../lib/input');

async function runTransactionSenderTest() {
  logHeader('🚀 Running Transaction Sender Test...');

  if (!validateSigningConfig()) {
    return;
  }

  const format = config.BLOCKCHAIN_FORMAT.toLowerCase();
  log(`🔧 Blockchain format: ${format.toUpperCase()}`, colors.blue);

  try {
    logHeader('📝 Requesting Raw Transaction...');
    const rawTx = await getUserInput('Enter the raw transaction string: ');

    if (!rawTx || rawTx.trim() === '') {
      throw new Error('Raw transaction string is required');
    }

    logHeader('🔐 Signing Transaction...');
    const signedTx = await signTransaction(rawTx.trim());
    logSuccess(`✅ ${format.toUpperCase()} transaction signed successfully!`);

    logHeader('📤 Publishing Transaction...');
    await publishSignedTransaction(signedTx);
    logSuccess('✅ Published signed transaction to message queue');

  } catch (error) {
    logError(`❌ Failed to process transaction: ${error.message}`);
    throw error;
  }
}

async function main() {
  try {
    logHeader('🏦 Green Bonds Platform - Transaction Sender');
    log('=================================================\n', colors.bright);
    log(`📅 Started at: ${new Date().toISOString()}`, colors.dim);

    logHeader('🔍 Checking Infrastructure...');

    await runTransactionSenderTest();

    logHeader('✨ Transaction Sender Completed Successfully!');
    log(`📅 Completed at: ${new Date().toISOString()}`, colors.dim);

  } catch (error) {
    logError(`❌ Transaction sender failed: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { runTransactionSenderTest };