import { config } from "dotenv";
import { JsonRpcProvider, NonceManager, Wallet, type Signer, type TransactionRequest } from "ethers";
import {
  getNetworkConfig,
  validateNetwork,
  getPrivateKeys,
  info,
  error as logError,
  type NetworkConfig,
} from "@hashgraph/asset-tokenization-contracts/scripts";

const HEDERA_FALLBACK_GAS_LIMIT = BigInt(8_000_000);

/**
 * JsonRpcProvider that falls back to a high static gasLimit when estimateGas
 * fails. Hedera's JSON-RPC relay returns non-standard errors for gas estimation
 * on contract deployments, causing ethers v6 to throw CALL_EXCEPTION.
 */
class HederaFriendlyProvider extends JsonRpcProvider {
  override async estimateGas(tx: TransactionRequest): Promise<bigint> {
    try {
      return await super.estimateGas(tx);
    } catch {
      info(`Gas estimation failed, using fallback gasLimit: ${HEDERA_FALLBACK_GAS_LIMIT}`);
      return HEDERA_FALLBACK_GAS_LIMIT;
    }
  }
}

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
  const provider = new HederaFriendlyProvider(networkConfig.jsonRpcUrl);
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
