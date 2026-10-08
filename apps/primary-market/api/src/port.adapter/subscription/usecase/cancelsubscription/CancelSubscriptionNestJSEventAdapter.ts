// SPDX-License-Identifier: Apache-2.0

import type { CommandBus } from "@hashgraph/green-bonds-shared-core"
import { EventListener, Handler, Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { CancelSubscriptionPort } from "./CancelSubscriptionPort"
import { SubscriptionCancelledDLTEvent } from "./model/SubscriptionCancelledDLTEvent"
import { CancelSubscriptionCommand } from "@app/subscription/cancelsubscription/command/CancelSubscriptionCommand"

@Singleton()
export class CancelSubscriptionNestJSEventAdapter
  implements CancelSubscriptionPort, EventListener<SubscriptionCancelledDLTEvent>
{
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Handler(SubscriptionCancelledDLTEvent)
  async handle(event: SubscriptionCancelledDLTEvent): Promise<void> {
    await this.commandBus.execute(
      new CancelSubscriptionCommand(Number(event.offeringId), event.contractId, Number(event.subscriptionId)),
    )
  }
}
