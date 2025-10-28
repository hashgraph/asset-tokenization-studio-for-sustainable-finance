const { config } = require('../../shared/lib/config');
const { log, logSuccess, logError, logHeader, colors } = require('../../shared/lib/logger');
const { signTransaction, validateSigningConfig } = require('../../shared/lib/transaction-signer');
const { publishSignedTransaction } = require('../../shared/lib/infrastructure');
const { createOffering } = require('./offering-service');
const { getUserInput } = require('../../shared/lib/input');

async function runOfferingCreationSimulator() {
  logHeader('🚀 Running Offering Creation Simulator...');
  
  if (!validateSigningConfig()) {
    return;
  }
  
  const format = config.BLOCKCHAIN_FORMAT.toLowerCase();
  
  // Prompt for required contract IDs
  log('\n📝 Please provide the following information:', colors.bright);
  const marketContractId = await getUserInput('Market Contract ID (e.g., 0.0.1234567): ');
  const bondContractId = await getUserInput('Bond Contract ID (e.g., 0.0.7654321): ');
  
  if (!marketContractId || !bondContractId) {
    logError('Market Contract ID and Bond Contract ID are required!');
    return;
  }
  
  const offering = await createOffering(format, marketContractId, bondContractId);
  
  try {
    const signedTx = await signTransaction(offering.unsignedTx);
    
    logSuccess(`${format.toUpperCase()} offering transaction signed successfully!`);
    
    await publishSignedTransaction(signedTx);
    
    logHeader('🎉 Offering Creation Simulation Completed!');
    logSuccess(`Created and signed ${format.toUpperCase()} offering transaction`);
    logSuccess('Published signed transaction to message queue');
    
  } catch (error) {
    logError(`Failed to sign offering transaction: ${error.message}`);
    logError('Make sure:');
    logError('   • Private key in .env file is valid for the selected blockchain format');
    logError('   • For Hedera: HEDERA_PRIVATE_KEY should be in DER format');
    logError('   • For Ethereum: ETHEREUM_PRIVATE_KEY should be in hex format');
  }
}

async function main() {
  try {
    logHeader('📊 Evercity Offering Creation Simulator');
    log('========================================\n', colors.bright);
    log(`📡 Blockchain Format: ${config.BLOCKCHAIN_FORMAT.toUpperCase()}`, colors.blue);
    
    await runOfferingCreationSimulator();
    
  } catch (error) {
    logError(`Offering simulation failed: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { runOfferingCreationSimulator };
