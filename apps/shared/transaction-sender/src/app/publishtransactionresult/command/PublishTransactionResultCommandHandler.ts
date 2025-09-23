// SPDX-License-Identifier: Apache-2.0

import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { PublishTransactionResultCommand } from "./PublishTransactionResultCommand"
import { TransactionResultPublishedEvent } from "@domain/events/TransactionResultPublishedEvent"
import type { PublishTransactionResultPort } from "@port/publishtransactionresult/PublishTransactionResultPort"
import type { TransactionResult } from "@domain/model/TransactionResult"

@Singleton()
@Handler(PublishTransactionResultCommand)
export class PublishTransactionResultCommandHandler implements CommandHandler<PublishTransactionResultCommand, void> {
  constructor(
    @Inject() private readonly eventBus: EventBus,
    @Inject() private readonly publishTransactionResult: PublishTransactionResultPort,
  ) {}

  @Validate()
  async execute(command: PublishTransactionResultCommand): Promise<void> {
    const transactionResult: TransactionResult = {
      payload: command.payload,
      metadata: command.metadata,
      format: command.format,
      transactionHash: command.transactionHash,
      status: command.status,
      errorCode: command.errorCode,
    }

    await this.publishTransactionResult.publishResult(transactionResult)

    const event = new TransactionResultPublishedEvent(
      command.payload,
      command.metadata,
      command.format,
      command.transactionHash,
      command.status,
      command.errorCode,
    )

    this.eventBus.publish(event)
  }
}
