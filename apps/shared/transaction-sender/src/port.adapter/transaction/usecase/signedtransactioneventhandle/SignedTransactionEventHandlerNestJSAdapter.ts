// SPDX-License-Identifier: Apache-2.0

import { EventListener, Inject, Singleton, Handler } from "@hashgraph/green-bonds-shared-core"
import type { CommandBus } from "@hashgraph/green-bonds-shared-core"
import { SignedTransactionSentEvent } from "@domain/events/SignedTransactionSentEvent"
import { PublishTransactionResultCommand } from "@app/publishtransactionresult/command/PublishTransactionResultCommand"
import { SignedTransactionEventHandlerPort } from "./SignedTransactionEventHandlerPort"

@Singleton()
export class SignedTransactionEventHandlerNestJSAdapter
  implements EventListener<SignedTransactionSentEvent>, SignedTransactionEventHandlerPort
{
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Handler(SignedTransactionSentEvent)
  async handle(event: SignedTransactionSentEvent): Promise<void> {
    const command = new PublishTransactionResultCommand(
      event.payload,
      event.metadata,
      event.format,
      event.transactionHash,
      event.status,
      event.errorCode,
    )

    await this.commandBus.execute(command)
  }
}
