const { config } = require('../../shared/lib/config');
const { log, logSuccess, logError, logHeader, colors } = require('../../shared/lib/logger');
const { signTransaction, validateSigningConfig } = require('../../shared/lib/transaction-signer');
const { publishSignedTransaction } = require('../../shared/lib/infrastructure');
const { createBond } = require('./bond-service');

async function runBondCreationSimulator(overridesBondCreationRequest = {}) {
  logHeader('🚀 Running Bond Creation Simulator...');
  
  if (!validateSigningConfig()) {
    return;
  }
  
  const format = config.BLOCKCHAIN_FORMAT.toLowerCase();

  const bond = await createBond(format, overridesBondCreationRequest);

  try {
    const signedTx = await signTransaction(bond.unsignedTx);
    
    logSuccess(`${format.toUpperCase()} bond transaction signed successfully!`);
    
    await publishSignedTransaction(signedTx);
    
    logHeader('🎉 Bond Creation Simulation Completed!');
    logSuccess(`Created and signed ${format.toUpperCase()} bond transaction`);
    logSuccess('Published signed transaction to message queue');
    
    return bond;
    
  } catch (error) {
    logError(`Failed to sign bond transaction: ${error.message}`);
    logError('Make sure:');
    logError('   • Private key in .env file is valid for the selected blockchain format');
    logError('   • For Hedera: HEDERA_PRIVATE_KEY should be in DER format');
    logError('   • For Ethereum: ETHEREUM_PRIVATE_KEY should be in hex format');
  }
}

async function main() {
  try {
    logHeader('🏦 Evercity Bond Creation Simulator');
    log('==================================\n', colors.bright);
    log(`📡 Blockchain Format: ${config.BLOCKCHAIN_FORMAT.toUpperCase()}`, colors.blue);
    
    await runBondCreationSimulator();
    
  } catch (error) {
    logError(`Bond simulation failed: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { runBondCreationSimulator };