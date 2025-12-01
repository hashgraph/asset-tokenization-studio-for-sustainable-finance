// SPDX-License-Identifier: Apache-2.0

import type { CommandBus } from "@hashgraph/green-bonds-shared-core"
import { ConverterUtils, EventListener, Handler, Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { ExecuteOfferingPort } from "./ExecuteOfferingPort"
import { OfferingExecutedDLTEvent } from "./model/OfferingExecutedDLTEvent"
import { ExecuteOfferingCommand } from "@app/offering/executeoffering/command/ExecuteOfferingCommand"

@Singleton()
export class ExecuteOfferingNestJSEventAdapter implements ExecuteOfferingPort, EventListener<OfferingExecutedDLTEvent> {
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Handler(OfferingExecutedDLTEvent)
  async handle(event: OfferingExecutedDLTEvent): Promise<void> {
    await this.commandBus.execute(
      new ExecuteOfferingCommand(
        Number(event.offeringId),
        event.contractId,
        await ConverterUtils.getHederaAddressFromEvm(event.operator),
        event.result,
      ),
    )
  }
}
