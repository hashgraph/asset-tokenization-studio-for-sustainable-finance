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

  // Ask if user wants to customize offering parameters
  log('\n⚙️  Offering Parameters:', colors.bright);
  const useDefaults = await getUserInput('Use default offering parameters? (yes/no): ');

  let offeringParams = {};

  if (useDefaults.toLowerCase() !== 'yes') {
    log('\nEnter custom parameters (press Enter to use default):', colors.bright);

    const treasuryAddress = await getUserInput('Treasury Address (default: env or 0x48ca...): ');
    const paymentTokenAddress = await getUserInput('Payment Token Address (default: env or 0x48ca...): ');
    const lotSize = await getUserInput('Lot Size (default: 100): ');
    const minQuantity = await getUserInput('Min Quantity (default: 1000): ');
    const maxQuantity = await getUserInput('Max Quantity (default: 10000): ');
    const targetQuantity = await getUserInput('Target Quantity (default: 5000): ');
    const targetQuantityRule = await getUserInput('Target Quantity Rule (0=None, 1=AtLeast, default: 1): ');
    const daysUntilEnd = await getUserInput('Days until offering ends (default: 30): ');
    const deadlineRule = await getUserInput('Deadline Rule (0=None, 1=Strict, default: 1): ');

    offeringParams = {
      ...(treasuryAddress && { treasuryAddress }),
      ...(paymentTokenAddress && { paymentTokenAddress }),
      ...(lotSize && { lotSize: parseInt(lotSize) }),
      ...(minQuantity && { minQuantity: parseInt(minQuantity) }),
      ...(maxQuantity && { maxQuantity: parseInt(maxQuantity) }),
      ...(targetQuantity && { targetQuantity: parseInt(targetQuantity) }),
      ...(targetQuantityRule && { targetQuantityRule: parseInt(targetQuantityRule) }),
      ...(daysUntilEnd && {
        startDate: Math.floor(Date.now() / 1000).toString(),
        endDate: Math.floor((Date.now() / 1000) + (parseInt(daysUntilEnd) * 24 * 60 * 60)).toString()
      }),
      ...(deadlineRule && { deadlineRule: parseInt(deadlineRule) })
    };
  }

  const offering = await createOffering(format, marketContractId, bondContractId, offeringParams);
  
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
