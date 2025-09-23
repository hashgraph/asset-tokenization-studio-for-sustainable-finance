// SPDX-License-Identifier: Apache-2.0

import { EventListener, Inject, Singleton, Handler } from "@hashgraph/green-bonds-shared-core"
import { SignedTransactionSentEvent } from "@domain/events/SignedTransactionSentEvent"
import type { PublishTransactionResultPort } from "../../../publishtransactionresult/PublishTransactionResultPort"
import { SignedTransactionEventListenerPort } from "./SignedTransactionEventListenerPort"

@Singleton()
export class PublishTransactionResultAdapter
  implements EventListener<SignedTransactionSentEvent>, SignedTransactionEventListenerPort
{
  constructor(@Inject() private readonly publishTransactionResult: PublishTransactionResultPort) {}

  @Handler(SignedTransactionSentEvent)
  async handle(event: SignedTransactionSentEvent): Promise<void> {
    await this.handleSignedTransactionSentEvent(event)
  }

  async handleSignedTransactionSentEvent(event: SignedTransactionSentEvent): Promise<void> {
    await this.publishTransactionResult.publishResult({
      payload: event.payload,
      metadata: event.metadata,
      format: event.format,
      transactionHash: event.transactionHash,
      status: event.status,
      errorCode: event.errorCode,
    })
  }
}
