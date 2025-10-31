// SPDX-License-Identifier: Apache-2.0

import type { CommandBus } from "@hashgraph/green-bonds-shared-core"
import { ConverterUtils, EventListener, Handler, Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { CancelOfferingPort } from "./CancelOfferingPort"
import { OfferingCancelledDLTEvent } from "./model/OfferingCancelledDLTEvent"
import { CancelOfferingCommand } from "@app/offering/canceloffering/command/CancelOfferingCommand"

@Singleton()
export class CancelOfferingNestJSEventAdapter implements CancelOfferingPort, EventListener<OfferingCancelledDLTEvent> {
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Handler(OfferingCancelledDLTEvent)
  async handle(event: OfferingCancelledDLTEvent): Promise<void> {
    await this.commandBus.execute(
      new CancelOfferingCommand(
        event.offeringId,
        event.contractId,
        await ConverterUtils.getHederaAddressFromEvm(event.operator),
        event.subscriptionIdsSuccess,
        event.subscriptionIdsFailed,
      ),
    )
  }
}
