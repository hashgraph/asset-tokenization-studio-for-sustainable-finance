import { SignedTransactionMessage } from '../../domain/model/SignedTransactionMessage';

/**
 * Port interface for sending signed transactions.
 * Defines the contract for processing signed transaction messages from different blockchain formats.
 * This port is infrastructure-agnostic and focuses on the business capability.
 */
export interface SendSignedTransactionPort {
  /**
   * Processes an incoming Hedera format transaction message.
   * @param message - The signed transaction message with Hedera format payload
   */
  onHederaMessage(message: SignedTransactionMessage): Promise<void>;

  /**
   * Processes an incoming Ethereum format transaction message.
   * @param message - The signed transaction message with Ethereum format payload
   */
  onEthereumMessage(message: SignedTransactionMessage): Promise<void>;
}
