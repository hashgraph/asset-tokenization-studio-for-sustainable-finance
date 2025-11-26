// SPDX-License-Identifier: Apache-2.0

import type { CommandBus } from "@hashgraph/green-bonds-shared-core"
import { ConverterUtils, EventListener, Handler, Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { CreateOfferingPort } from "./CreateOfferingPort"
import { OfferingCreatedDLTEvent } from "./model/OfferingCreatedDLTEvent"
import { CreateOfferingCommand } from "@app/offering/createoffering/command/CreateOfferingCommand"

@Singleton()
export class CreateOfferingNestJSEventAdapter implements CreateOfferingPort, EventListener<OfferingCreatedDLTEvent> {
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Handler(OfferingCreatedDLTEvent)
  async handle(event: OfferingCreatedDLTEvent): Promise<void> {
    await this.commandBus.execute(
      new CreateOfferingCommand(
        Number(event.offeringId),
        event.contractId,
        await ConverterUtils.getHederaAddressFromEvm(event.asset),
        await ConverterUtils.getHederaAddressFromEvm(event.operator),
        await ConverterUtils.getHederaAddressFromEvm(event.treasury),
        await ConverterUtils.getHederaAddressFromEvm(event.paymentToken),
        event.lotSize,
        event.minLots,
        event.maxLots,
        event.targetLots,
        event.targetQuantityRule,
        new Date(Number(event.startDate) * 1000),
        new Date(Number(event.endDate) * 1000),
        event.deadlineRule,
        event.price,
        event.priceDecimals,
      ),
    )
  }
}
