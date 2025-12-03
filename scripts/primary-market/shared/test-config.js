/**
 * Test Configuration Constants
 * 
 * This file contains shared configuration constants used across primary market test scripts.
 * These are test/demo values and should not be used in production.
 */

// Primary Market Factory Resolver Contract ID (testnet)
const RESOLVER_CONTRACT_ID = '0.0.7362135';

// Primary Market Factory Contract ID (testnet)
const FACTORY_CONTRACT_ID = '0.0.7362250';

// Config version for primary market deployment
const CONFIG_VERSION = 0;

// Bond Contract ID (testnet) - Used for offering creation and management
const BOND_CONTRACT_ID = '0.0.7319744';

// Treasury Contract ID (testnet) - Used for payment processing
const TREASURY_CONTRACT_ID = '0.0.7319745';

module.exports = {
  RESOLVER_CONTRACT_ID,
  FACTORY_CONTRACT_ID,
  CONFIG_VERSION,
  BOND_CONTRACT_ID,
  TREASURY_CONTRACT_ID,
};
