// SPDX-License-Identifier: Apache-2.0

import { SignedTransactionMessage } from 'src/domain/model/SignedTransactionMessage';

/**
 * Port interface for processing Ethereum signed transactions.
 * Defines the contract for handling Ethereum-specific transaction messages.
 * This port is infrastructure-agnostic and focuses on Ethereum business capabilities.
 */
export interface SendEthereumSignedTransactionPort {
  /**
   * Processes an incoming Ethereum format transaction message.
   * @param message - The signed transaction message with Ethereum format payload
   * @throws {Error} When transaction processing fails
   */
  onEthereumMessage(message: SignedTransactionMessage): Promise<void>;
}
