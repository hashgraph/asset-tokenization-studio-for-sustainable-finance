const { gatewayClient } = require('../../shared/lib/gateway-client');
const { logSuccess, logError, logInfo, log, colors, logHeader } = require('../../shared/lib/logger');
const { signTransaction, validateSigningConfig } = require('../../shared/lib/transaction-signer');
const { publishSignedTransaction } = require('../../shared/lib/infrastructure');
const { config } = require('../../shared/lib/config');

/**
 * Cancel a subscription to an offering
 * @param {string} format - The blockchain format (hedera or ethereum)
 * @param {string} marketContractId - The primary market contract ID
 * @param {string} offeringId - The offering ID
 * @returns {Promise<Object>} The cancel subscription transaction details
 */
async function cancelSubscription(format, marketContractId, offeringId) {
  logHeader(`📋 Canceling subscription in ${format.toUpperCase()} Primary Market...`);
  
  const cancelRequest = {
    format: format,
    accountId: process.env.ACCOUNT_ID
  };
  
  try {
    logInfo('Sending cancel subscription request to gateway...');
    const endpoint = `/api/v1/primary-markets/${marketContractId}/offerings/${offeringId}/subscriptions`;
    const response = await gatewayClient.delete(endpoint, { data: cancelRequest });
    
    logSuccess(`${format.toUpperCase()} Cancel subscription transaction created!`);
    logInfo(`Market Contract ID: ${marketContractId}`);
    logInfo(`Offering ID: ${offeringId}`);
    logInfo(`Unsigned Tx: ${response.data.unsignedTx.substring(0, 50)}...`);
    
    return { ...cancelRequest, unsignedTx: response.data.unsignedTx };
  } catch (error) {
    logError(`Failed to create cancel subscription transaction: ${error.message}`);
    if (error.response?.data) {
      logError(`Response data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    throw error;
  }
}

/**
 * Main execution function
 */
async function main() {
  try {
    logHeader('🚀 CANCEL SUBSCRIPTION SCRIPT');
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
    
    // Configuration parameters
    // TODO: Replace these with actual values or command line arguments
    const marketContractId = process.env.MARKET_CONTRACT_ID || '0.0.123456';
    const offeringId = process.env.OFFERING_ID || '1';
    
    logInfo(`Market Contract ID: ${marketContractId}`);
    logInfo(`Offering ID: ${offeringId}`);
    log('');
    
    // Step 1: Cancel Subscription
    const cancelTx = await cancelSubscription(format, marketContractId, offeringId);
    
    // Step 2: Sign the transaction
    logHeader('🔐 Signing transaction...');
    const signedTx = await signTransaction(cancelTx.unsignedTx);
    logSuccess('Transaction signed successfully!');
    logInfo(`Signed Tx: ${signedTx.substring(0, 50)}...`);
    
    // Step 3: Publish to RabbitMQ
    await publishSignedTransaction(signedTx, {
      description: 'Cancel Subscription',
      marketContractId: marketContractId,
      offeringId: offeringId
    });
    
    logHeader('✨ Cancel subscription completed!');
    log('The transaction has been sent to the transaction processor.', colors.green);
    log('Monitor the logs to see when the subscription is canceled.\n', colors.green);
    
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
  cancelSubscription
};
