// SPDX-License-Identifier: Apache-2.0

import { EventListener, Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { SignedTransactionSentEvent } from "../../../domain/events/SignedTransactionSentEvent"
import type { PublishTransactionResultPort } from "../../../port.adapter/publishtransactionresult/PublishTransactionResultPort"

@Singleton()
export class PublishTransactionResultHandler implements EventListener<SignedTransactionSentEvent> {
  constructor(@Inject() private readonly publishTransactionResult: PublishTransactionResultPort) {}

  async handle(event: SignedTransactionSentEvent): Promise<void> {
    await this.publishTransactionResult.publishResult({
      payload: event.payload,
      metadata: event.metadata,
      format: event.format,
      transactionHash: event.transactionHash,
    })
  }
}
