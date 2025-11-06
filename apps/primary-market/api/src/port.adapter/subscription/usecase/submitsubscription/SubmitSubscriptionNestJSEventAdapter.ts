// SPDX-License-Identifier: Apache-2.0

import type { CommandBus } from "@hashgraph/green-bonds-shared-core"
import { ConverterUtils, EventListener, Handler, Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { SubmitSubscriptionPort } from "./SubmitSubscriptionPort"
import { SubscriptionSubmittedDLTEvent } from "./model/SubscriptionSubmittedDLTEvent"
import { SubmitSubscriptionCommand } from "@app/subscription/submitsubscription/command/SubmitSubscriptionCommand"

@Singleton()
export class SubmitSubscriptionNestJSEventAdapter
  implements SubmitSubscriptionPort, EventListener<SubscriptionSubmittedDLTEvent>
{
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Handler(SubscriptionSubmittedDLTEvent)
  async handle(event: SubscriptionSubmittedDLTEvent): Promise<void> {
    await this.commandBus.execute(
      new SubmitSubscriptionCommand(
        event.offeringId,
        event.contractId,
        event.subscriptionId,
        await ConverterUtils.getHederaAddressFromEvm(event.investor),
        event.lotUnits,
      ),
    )
  }
}
