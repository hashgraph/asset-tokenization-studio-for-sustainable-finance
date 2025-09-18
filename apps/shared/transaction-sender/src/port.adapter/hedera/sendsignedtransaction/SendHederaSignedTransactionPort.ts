// SPDX-License-Identifier: Apache-2.0

import { SignedTransactionMessage } from '../../../domain/model/SignedTransactionMessage';

/**
 * Port interface for processing Hedera signed transactions.
 * Defines the contract for handling Hedera-specific transaction messages.
 * This port is infrastructure-agnostic and focuses on Hedera business capabilities.
 */
export interface SendHederaSignedTransactionPort {
  /**
   * Processes an incoming Hedera format transaction message.
   * @param message - The signed transaction message with Hedera format payload
   * @throws {Error} When transaction processing fails
   */
  onHederaMessage(message: SignedTransactionMessage): Promise<void>;
}
