// SPDX-License-Identifier: Apache-2.0

import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { SendSignedTransactionCommand } from "./SendSignedTransactionCommand"
import { SignedTransactionMessage } from "../../../domain/model/SignedTransactionMessage"
import { SignedTransactionSentEvent } from "../../../domain/events/SignedTransactionSentEvent"
import type { BlockchainTransactionSenderPort } from "../../../port.adapter/transactionsender/BlockchainTransactionSenderPort"

@Singleton()
@Handler(SendSignedTransactionCommand)
export class SendSignedTransactionCommandHandler implements CommandHandler<SendSignedTransactionCommand, void> {
  constructor(
    @Inject() private readonly eventBus: EventBus,
    @Inject() private readonly blockchainTransactionSender: BlockchainTransactionSenderPort,
  ) {}

  @Validate()
  async execute(command: SendSignedTransactionCommand): Promise<void> {
    const signedTransaction = new SignedTransactionMessage()
    signedTransaction.payload = command.payload
    signedTransaction.metadata = command.metadata
    signedTransaction.format = command.format

    const transactionResult = await this.blockchainTransactionSender.sendTransaction(signedTransaction)

    const event = new SignedTransactionSentEvent(
      command.payload,
      signedTransaction.metadata,
      command.format,
      transactionResult.transactionId,
      transactionResult.status,
    )

    this.eventBus.publish(event)
  }
}
