const { gatewayClient } = require('../../shared/lib/gateway-client');
const { logSuccess, logError, logInfo, log, colors } = require('../../shared/lib/logger');

/**
 * Fetches all subscriptions for a given offering
 * @param {string} marketContractId - The market contract ID
 * @param {number} offeringId - The offering ID
 * @param {number} page - Page number (default: 0)
 * @param {number} size - Page size (default: 100)
 * @returns {Promise<Object>} Subscriptions data with pagination info
 */
async function fetchSubscriptions(marketContractId, offeringId, page = 0, size = 100) {
  try {
    const endpoint = `/api/v1/primary-markets/${marketContractId}/offerings/${offeringId}/subscriptions`;
    const params = { page, size };

    const response = await gatewayClient.get(endpoint, { params });
    return response.data;
  } catch (error) {
    logError(`Failed to fetch subscriptions: ${error.message}`);
    if (error.response?.data) {
      logError(`Response data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    throw error;
  }
}

/**
 * Fetches all subscriptions across all pages
 * @param {string} marketContractId - The market contract ID
 * @param {number} offeringId - The offering ID
 * @returns {Promise<Array>} All subscriptions
 */
async function fetchAllSubscriptions(marketContractId, offeringId) {
  log(`\n📦 Fetching all subscriptions for offering ${offeringId}...`, colors.bright);

  let allSubscriptions = [];
  let page = 0;
  const pageSize = 100;
  let totalPages = 1;

  do {
    const result = await fetchSubscriptions(marketContractId, offeringId, page, pageSize);
    allSubscriptions = allSubscriptions.concat(result.data);
    totalPages = result.totalPages;
    page++;

    logInfo(`Fetched page ${page}/${totalPages} (${result.data.length} subscriptions)`);
  } while (page < totalPages);

  logSuccess(`Total subscriptions fetched: ${allSubscriptions.length}`);
  return allSubscriptions;
}

/**
 * Filters subscriptions by status
 * @param {Array} subscriptions - Array of subscription objects
 * @param {string} status - Status to filter by (SUBMITTED, EXECUTED, FAILED, CANCELLED)
 * @returns {Array} Filtered subscriptions
 */
function filterSubscriptionsByStatus(subscriptions, status) {
  return subscriptions.filter(sub => sub.status === status);
}

/**
 * Analyzes subscriptions and categorizes them for settlement
 * @param {Array} subscriptions - Array of all subscriptions
 * @returns {Object} Categorized subscriptions
 */
function analyzeSubscriptionsForSettlement(subscriptions) {
  log(`\n📊 Analyzing subscriptions for settlement...`, colors.bright);

  const submitted = filterSubscriptionsByStatus(subscriptions, 'SUBMITTED');
  const executed = filterSubscriptionsByStatus(subscriptions, 'EXECUTED');
  const failed = filterSubscriptionsByStatus(subscriptions, 'FAILED');
  const cancelled = filterSubscriptionsByStatus(subscriptions, 'CANCELLED');

  logInfo(`SUBMITTED: ${submitted.length}`);
  logInfo(`EXECUTED: ${executed.length}`);
  logInfo(`FAILED: ${failed.length}`);
  logInfo(`CANCELLED: ${cancelled.length}`);

  return { submitted, executed, failed, cancelled };
}

/**
 * Executes offering settlement transaction
 * @param {string} format - Blockchain format (hedera/ethereum)
 * @param {string} marketContractId - The market contract ID
 * @param {number} offeringId - The offering ID
 * @param {Array<number>} subscriptionIdsSuccess - Array of successful subscription IDs
 * @param {Array<number>} subscriptionIdsFailed - Array of failed subscription IDs
 * @param {string} start - Start index for batch processing
 * @param {string} end - End index for batch processing
 * @returns {Promise<Object>} Transaction response
 */
async function executeOfferingSettlement(format, marketContractId, offeringId, subscriptionIdsSuccess, subscriptionIdsFailed, start, end) {
  log(`\n💰 Executing offering settlement...`, colors.bright);

  const executeOfferingRequest = {
    format: format,
    accountId: process.env.ACCOUNT_ID,
    start: start,
    end: end
  };

  logInfo(`Format: ${format.toUpperCase()}`);
  logInfo(`Market Contract ID: ${marketContractId}`);
  logInfo(`Offering ID: ${offeringId}`);
  logInfo(`Success IDs (${subscriptionIdsSuccess.length}): ${subscriptionIdsSuccess.slice(0, 5).join(', ')}${subscriptionIdsSuccess.length > 5 ? '...' : ''}`);
  logInfo(`Failed IDs (${subscriptionIdsFailed.length}): ${subscriptionIdsFailed.slice(0, 5).join(', ')}${subscriptionIdsFailed.length > 5 ? '...' : ''}`);
  logInfo(`Batch range: ${start} - ${end}`);

  try {
    const endpoint = `/api/v1/primary-markets/${marketContractId}/offerings/${offeringId}`;
    const response = await gatewayClient.post(endpoint, executeOfferingRequest);

    logSuccess(`${format.toUpperCase()} settlement transaction created successfully!`);
    logInfo(`Unsigned Tx: ${response.data.unsignedTx}`);

    return {
      ...executeOfferingRequest,
      unsignedTx: response.data.unsignedTx,
      subscriptionIdsSuccess,
      subscriptionIdsFailed
    };
  } catch (error) {
    logError(`Failed to execute offering settlement: ${error.message}`);
    if (error.response?.data) {
      logError(`Response data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    throw error;
  }
}

/**
 * Prepares settlement data by fetching subscriptions and determining which to settle
 * @param {string} marketContractId - The market contract ID
 * @param {number} offeringId - The offering ID
 * @param {Object} options - Settlement options
 * @param {boolean} options.autoSelectSuccess - Auto-select SUBMITTED as success (default: true)
 * @param {Array<number>} options.manualSuccessIds - Manually specified success IDs
 * @param {Array<number>} options.manualFailIds - Manually specified fail IDs
 * @returns {Promise<Object>} Settlement data
 */
async function prepareSettlementData(marketContractId, offeringId, options = {}) {
  const {
    autoSelectSuccess = true,
    manualSuccessIds = [],
    manualFailIds = []
  } = options;

  // Fetch all subscriptions
  const allSubscriptions = await fetchAllSubscriptions(marketContractId, offeringId);

  if (allSubscriptions.length === 0) {
    logError('No subscriptions found for this offering!');
    throw new Error('No subscriptions available for settlement');
  }

  // Analyze subscriptions
  const categorized = analyzeSubscriptionsForSettlement(allSubscriptions);

  let successIds = [...manualSuccessIds];
  let failIds = [...manualFailIds];

  // Auto-select SUBMITTED subscriptions as success if enabled
  if (autoSelectSuccess && categorized.submitted.length > 0) {
    const submittedIds = categorized.submitted.map(sub => sub.id);
    successIds = [...new Set([...successIds, ...submittedIds])];
    logInfo(`Auto-selected ${submittedIds.length} SUBMITTED subscriptions for success`);
  }

  // Calculate batch range (0 to total count)
  const totalToSettle = successIds.length + failIds.length;
  const start = '0';
  const end = totalToSettle.toString();

  log(`\n📋 Settlement Summary:`, colors.bright);
  logInfo(`Total subscriptions to settle: ${totalToSettle}`);
  logInfo(`Success count: ${successIds.length}`);
  logInfo(`Fail count: ${failIds.length}`);
  logInfo(`Batch range: ${start} - ${end}`);

  return {
    allSubscriptions,
    categorized,
    successIds,
    failIds,
    start,
    end,
    totalToSettle
  };
}

module.exports = {
  fetchSubscriptions,
  fetchAllSubscriptions,
  filterSubscriptionsByStatus,
  analyzeSubscriptionsForSettlement,
  executeOfferingSettlement,
  prepareSettlementData
};
