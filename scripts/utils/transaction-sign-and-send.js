const { config } = require('../shared/lib/config');
const { log, logSuccess, logError, logHeader, colors } = require('../shared/lib/logger');
const { signTransaction, validateSigningConfig } = require('../shared/lib/transaction-signer');
const { publishSignedTransaction } = require('../shared/lib/infrastructure');
const { getUserInput } = require('../shared/lib/input');

async function runTransactionSignAndSend() {
  logHeader('🚀 Transaction Sign & Send Tool');

  if (!validateSigningConfig()) {
    return;
  }

  const format = config.BLOCKCHAIN_FORMAT.toLowerCase();
  log(`🔧 Blockchain Format: ${format.toUpperCase()}`, colors.blue);

  try {
    logHeader('📝 Enter Raw Transaction');
    const rawTx = await getUserInput('Enter the raw transaction (hex or base64): ');

    if (!rawTx || rawTx.trim() === '') {
      throw new Error('Raw transaction string is required');
    }

    logHeader('🔐 Signing Transaction...');
    const signedTx = await signTransaction(rawTx.trim());
    logSuccess(`✅ ${format.toUpperCase()} transaction signed successfully!`);

    logHeader('📤 Sending to Message Queue...');
    await publishSignedTransaction(signedTx);
    logSuccess('✅ Signed transaction published to message queue');

  } catch (error) {
    logError(`❌ Failed to sign/send transaction: ${error.message}`);
    throw error;
  }
}

async function main() {
  try {
    logHeader('🏦 Green Bonds Platform - Transaction Sign & Sender');
    log(`=================================================`, colors.bright);
    log(`📅 Started at: ${new Date().toISOString()}`, colors.dim);

    await runTransactionSignAndSend();

    logHeader('✨ Sign & Send Tool Completed Successfully!');
    log(`📅 Completed at: ${new Date().toISOString()}`, colors.dim);

  } catch (error) {
    logError(`❌ Sign & Send Tool failed: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { runTransactionSignAndSend };
