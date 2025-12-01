// SPDX-License-Identifier: Apache-2.0

import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { SendSignedTransactionCommand } from "./SendSignedTransactionCommand"
import { SignedTransactionRequest } from "@domain/model/SignedTransactionRequest"
import { SignedTransactionSentEvent } from "@domain/events/SignedTransactionSentEvent"
import type { BlockchainTransactionSenderPort } from "@port/transactionsender/BlockchainTransactionSenderPort"
import { BlockchainError } from "@domain/errors/BlockchainError"
import { BlockchainTransactionResponse } from "@domain/model/BlockchainTransactionResponse"

@Singleton()
@Handler(SendSignedTransactionCommand)
export class SendSignedTransactionCommandHandler implements CommandHandler<SendSignedTransactionCommand, void> {
  constructor(
    @Inject() private readonly eventBus: EventBus,
    @Inject() private readonly blockchainTransactionSender: BlockchainTransactionSenderPort,
  ) {}

  @Validate()
  async execute(command: SendSignedTransactionCommand): Promise<void> {
    const signedTransaction = new SignedTransactionRequest()
    signedTransaction.payload = command.payload
    signedTransaction.metadata = command.metadata
    signedTransaction.format = command.format

    let transactionResponse: BlockchainTransactionResponse

    try {
      transactionResponse = await this.blockchainTransactionSender.sendTransaction(signedTransaction)
    } catch (error: any) {
      if (error instanceof BlockchainError) {
        transactionResponse = {
          transactionId: error.transactionId,
          status: "failed",
          errorCode: error.errorCode,
        }
      } else {
        transactionResponse = {
          transactionId: "EXECUTION_FAILED",
          status: "failed",
          errorCode: "UNKNOWN_ERROR",
        }
      }
    }

    const event = new SignedTransactionSentEvent(
      command.payload,
      signedTransaction.metadata,
      command.format,
      transactionResponse.transactionId,
      transactionResponse.status,
      transactionResponse.errorCode,
    )

    this.eventBus.publish(event)
  }
}
