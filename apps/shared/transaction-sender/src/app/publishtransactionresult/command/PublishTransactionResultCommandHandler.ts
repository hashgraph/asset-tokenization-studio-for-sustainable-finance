// SPDX-License-Identifier: Apache-2.0

import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { PublishTransactionResultCommand } from "./PublishTransactionResultCommand"
import { SignedTransactionSentEvent } from "@domain/events/SignedTransactionSentEvent"
import type { PublishTransactionResultPort } from "@port/publishtransactionresult/PublishTransactionResultPort"

@Singleton()
@Handler(PublishTransactionResultCommand)
export class PublishTransactionResultCommandHandler implements CommandHandler<PublishTransactionResultCommand, void> {
  constructor(
    @Inject() private readonly eventBus: EventBus,
    @Inject() private readonly publishTransactionResultPort: PublishTransactionResultPort,
  ) {}

  @Validate()
  async execute(command: PublishTransactionResultCommand): Promise<void> {
    const event = new SignedTransactionSentEvent(
      command.payload,
      command.metadata,
      command.format,
      command.transactionHash,
      command.status,
      command.errorCode,
    )

    this.eventBus.publish(event)

    await this.publishTransactionResultPort.publishResult({
      payload: command.payload,
      metadata: command.metadata,
      format: command.format,
      transactionHash: command.transactionHash,
      status: command.status,
      errorCode: command.errorCode,
    })
  }
}
