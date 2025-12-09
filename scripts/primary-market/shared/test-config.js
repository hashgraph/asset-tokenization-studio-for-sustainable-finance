/**
 * Test Configuration Constants
 *
 * This file contains shared configuration constants used across primary market test scripts.
 * These are test/demo values and should not be used in production.
 */

const { ConverterUtils } = require("@hashgraph/green-bonds-shared-core");

// Async functions to get contract IDs from environment variables
const getResolverContractId = async () => {
  const resolverAddress = process.env.RESOLVER_ADDRESS;
  if (!resolverAddress) {
    console.warn("RESOLVER_ADDRESS not found in environment, using default");
    return "0.0.7408171";
  }
  return await ConverterUtils.getHederaAddressFromEvm(resolverAddress);
};

// Lazy-loaded values (will be populated on first access)
let _resolverContractId = null;

// Synchronous getters that return promises or cached values
const RESOLVER_CONTRACT_ID = new Promise(async (resolve) => {
  if (!_resolverContractId) {
    _resolverContractId = await getResolverContractId();
  }
  resolve(_resolverContractId);
});

const FACTORY_CONTRACT_ID = "0.0.7408279";

// Config version for primary market deployment
const CONFIG_VERSION = 0;

// Bond Contract ID (testnet) - Used for offering creation and management
const BOND_CONTRACT_ID = "0.0.7319744";

// Treasury Contract ID (testnet) - Used for payment processing
const TREASURY_CONTRACT_ID = "0.0.7319745";

module.exports = {
  RESOLVER_CONTRACT_ID,
  FACTORY_CONTRACT_ID,
  getResolverContractId,
  CONFIG_VERSION,
  BOND_CONTRACT_ID,
  TREASURY_CONTRACT_ID,
};
