/**
 * Shared Setup Service for Primary Market Scripts
 *
 * This module provides reusable functions for common setup operations
 * to avoid code duplication across multiple scripts.
 */

const { signTransaction } = require("../../shared/lib/transaction-signer");
const { publishSignedTransaction } = require("../../shared/lib/infrastructure");
const { logSuccess, logHeader } = require("../../shared/lib/logger");
const { deployPrimaryMarket } = require("../primarymarket/deploy-primary-market");
const { waitForPrimaryMarketDeployment, waitForUserRoleUpdate } = require("../primarymarket/get-latest-primary-market");
const { grantOfferingCreatorRole, OFFERING_CREATOR_ROLE } = require("./role-service");
const { deployHTSToken } = require("../offering/hts-token-service");

/**
 * Deploy a Primary Market and return its contract ID
 * @param {string} format - The blockchain format (hedera or ethereum)
 * @param {string} resolverContractId - The resolver contract ID
 * @param {number} configVersion - The config version
 * @returns {Promise<string>} The deployed market contract ID
 */
async function deployAndWaitForPrimaryMarket(format, resolverContractId, configVersion) {
  logHeader("Deploy Primary Market");
  const deploymentTx = await deployPrimaryMarket(format, resolverContractId, configVersion);

  logHeader("🔐 Signing deployment transaction...");
  const signedDeploymentTx = await signTransaction(deploymentTx.unsignedTx);
  logSuccess("Deployment transaction signed successfully!");

  await publishSignedTransaction(signedDeploymentTx, {
    description: "Deploy Primary Market",
  });

  const deployedMarket = await waitForPrimaryMarketDeployment();
  const marketContractId = deployedMarket.contractId;

  logSuccess(`✅ Primary Market deployed: ${marketContractId}`);

  return marketContractId;
}

/**
 * Grant OFFERING_CREATOR_ROLE to a user and wait for confirmation
 * @param {string} format - The blockchain format (hedera or ethereum)
 * @param {string} marketContractId - The primary market contract ID
 * @param {string} userAccountId - The user account ID
 * @returns {Promise<void>}
 */
async function grantOfferingCreatorRoleAndWait(format, marketContractId, userAccountId) {
  logHeader("Grant OFFERING_CREATOR_ROLE");
  const grantRoleTx = await grantOfferingCreatorRole(format, marketContractId, userAccountId);

  logHeader("🔐 Signing grant role transaction...");
  const signedGrantRoleTx = await signTransaction(grantRoleTx.unsignedTx);
  logSuccess("Grant role transaction signed successfully!");

  await publishSignedTransaction(signedGrantRoleTx, {
    description: "Grant OFFERING_CREATOR_ROLE",
  });

  await waitForUserRoleUpdate(marketContractId, OFFERING_CREATOR_ROLE, userAccountId, true);
  logSuccess(`✅ OFFERING_CREATOR_ROLE granted to ${userAccountId}`);
}

/**
 * Deploy HTS Payment Token
 * @param {string} name - Token name
 * @param {string} symbol - Token symbol
 * @param {number} decimals - Token decimals
 * @param {number} initialSupply - Initial supply
 * @returns {Promise<string>} The token ID
 */
async function deployPaymentToken(name, symbol, decimals, initialSupply) {
  logHeader("Deploy HTS Payment Token");
  const { tokenId } = await deployHTSToken(name, symbol, decimals, initialSupply);
  logSuccess(`✅ HTS Token deployed: ${tokenId}`);
  return tokenId;
}

/**
 * Complete setup: Deploy market, token, and grant role
 * @param {string} format - The blockchain format
 * @param {string} resolverContractId - The resolver contract ID
 * @param {number} configVersion - The config version
 * @param {string} userAccountId - The user account ID
 * @param {Object} tokenConfig - Token configuration {name, symbol, decimals, initialSupply}
 * @returns {Promise<{marketContractId: string, tokenId: string}>}
 */
async function setupPrimaryMarketWithToken(format, resolverContractId, configVersion, userAccountId, tokenConfig) {
  // Deploy HTS Payment Token
  const tokenId = await deployPaymentToken(
    tokenConfig.name || "Test Token",
    tokenConfig.symbol || "TST",
    tokenConfig.decimals || 6,
    tokenConfig.initialSupply || 1_000_000_000_000,
  );

  // Deploy Primary Market
  const marketContractId = await deployAndWaitForPrimaryMarket(format, resolverContractId, configVersion);

  // Grant OFFERING_CREATOR_ROLE
  await grantOfferingCreatorRoleAndWait(format, marketContractId, userAccountId);

  return { marketContractId, tokenId };
}

module.exports = {
  deployAndWaitForPrimaryMarket,
  grantOfferingCreatorRoleAndWait,
  deployPaymentToken,
  setupPrimaryMarketWithToken,
};
