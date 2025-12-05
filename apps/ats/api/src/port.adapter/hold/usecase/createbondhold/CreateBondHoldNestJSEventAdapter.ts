// SPDX-License-Identifier: Apache-2.0

import { ConverterUtils, type CommandBus } from "@hashgraph/green-bonds-shared-core"
import { EventListener, Handler, Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { HeldByPartitionDLTEvent } from "@port/hold/usecase/createbondhold/model/HeldByPartitionDLTEvent"
import { CreateBondHoldCommand } from "@app/hold/createbondhold/command/CreateBondHoldCommand"
import { CreateBondHoldPort } from "./CreateBondHoldPort"

@Singleton()
export class CreateBondHoldNestJSEventAdapter implements CreateBondHoldPort, EventListener<HeldByPartitionDLTEvent> {
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Handler(HeldByPartitionDLTEvent)
  async handle(event: HeldByPartitionDLTEvent): Promise<void> {
    const escrow = event.hold.escrow || ""
    const to = event.hold.to || ""

    await this.commandBus.execute(
      new CreateBondHoldCommand(
        Number(event.holdId),
        event.contractId,
        await ConverterUtils.getHederaAddressFromEvm(event.tokenHolder),
        event.partition,
        event.hold?.amount,
        new Date(Number(event.hold.expirationTimestamp) * 1000),
        escrow ? await ConverterUtils.getHederaAddressFromEvm(escrow) : "",
        to ? await ConverterUtils.getHederaAddressFromEvm(to) : "",
        event.hold.data,
        event.operatorData,
        await ConverterUtils.getHederaAddressFromEvm(event.operator),
      ),
    )
  }
}
