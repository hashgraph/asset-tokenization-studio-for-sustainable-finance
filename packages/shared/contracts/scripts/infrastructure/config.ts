import { config } from "dotenv";
import { JsonRpcProvider, NonceManager, Wallet, type Signer } from "ethers";
import {
  getNetworkConfig,
  validateNetwork,
  getPrivateKeys,
  info,
  error as logError,
  type NetworkConfig,
} from "@hashgraph/asset-tokenization-contracts/scripts";

// Load environment variables immediately
config();

// Re-export ATS utilities for convenience
export { getNetworkConfig, validateNetwork, type NetworkConfig };

/**
 * Create a signer for a specific network using environment configuration.
 *
 * @param network - Network name (e.g., 'hedera-testnet', 'hedera-mainnet')
 * @returns Ethers signer configured for the network
 * @throws Error if network is invalid or private key is missing
 *
 * @example
 * ```typescript
 * const signer = createSignerForNetwork('hedera-testnet')
 * ```
 */
export function createSignerForNetwork(network: string): Signer {
  // Validate network
  try {
    validateNetwork(network);
  } catch {
    throw new Error(`Invalid network: ${network}`);
  }

  // Get network configuration
  const networkConfig = getNetworkConfig(network);
  info(`Using network: ${network}`);
  info(`JSON-RPC URL: ${networkConfig.jsonRpcUrl}`);

  // Get private key from environment
  const privateKeys = getPrivateKeys(network);
  if (!privateKeys || privateKeys.length === 0) {
    logError(`Private key not found for network: ${network}`);
    logError(`Set environment variable: PRIVATE_KEY_${network.toUpperCase().replace(/-/g, "_")}`);
    throw new Error(`Missing private key for network: ${network}`);
  }

  const privateKey = privateKeys[0];

  // Create provider and signer with NonceManager to prevent nonce caching
  // issues when deploying multiple contracts via JSON-RPC
  const provider = new JsonRpcProvider(networkConfig.jsonRpcUrl);
  const wallet = new Wallet(privateKey, provider);
  const signer = new NonceManager(wallet);

  info(`Signer address: ${wallet.address}`);

  return signer;
}

/**
 * Get deployment options from environment variables.
 *
 * @returns Deployment options object
 */
export function getDeploymentOptionsFromEnv() {
  return {
    useTimeTravel: process.env.USE_TIME_TRAVEL === "true",
    verbose: process.env.VERBOSE === "true",
  };
}
