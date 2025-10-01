const { config } = require('../lib/config');
const { log, logSuccess, logError, logHeader, colors } = require('../lib/logger');
const { signTransaction, validateSigningConfig } = require('../lib/transaction-signer');
const { publishSignedTransaction, checkInfrastructure } = require('../lib/infrastructure');
const { createBond } = require('../lib/bond-service');

async function runBondCreationSimulator() {
  logHeader('🚀 Running Bond Creation Simulator...');
  
  if (!validateSigningConfig()) {
    return;
  }
  
  const format = config.BLOCKCHAIN_FORMAT.toLowerCase();
  
  const bond = await createBond(format);
  
  try {
    const signedTx = await signTransaction(bond.unsignedTx);
    
    logSuccess(`${format.toUpperCase()} bond transaction signed successfully!`);
    
    await publishSignedTransaction(signedTx);
    
    logHeader('🎉 Bond Creation Simulation Completed!');
    logSuccess(`Created and signed ${format.toUpperCase()} bond transaction`);
    logSuccess('Published signed transaction to message queue');
    
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
    
    const infrastructureReady = await checkInfrastructure();
    if (!infrastructureReady) {
      return;
    }
    
    logSuccess('Infrastructure OK! Starting Bond Creation Simulator...\n');
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