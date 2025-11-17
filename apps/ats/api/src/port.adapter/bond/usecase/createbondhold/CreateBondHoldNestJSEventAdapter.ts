// SPDX-License-Identifier: Apache-2.0

import { ConverterUtils, type CommandBus } from "@hashgraph/green-bonds-shared-core"
import { EventListener, Handler, Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { HeldByPartitionDLTEvent } from "@port/bond/usecase/createbondhold/model/HeldByPartitionDLTEvent"
import { CreateBondHoldCommand } from "@app/bond/createbondhold/command/CreateBondHoldCommand"
import { CreateBondHoldPort } from "./CreateBondHoldPort"

@Singleton()
export class CreateBondHoldNestJSEventAdapter implements CreateBondHoldPort, EventListener<HeldByPartitionDLTEvent> {
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Handler(HeldByPartitionDLTEvent)
  async handle(event: HeldByPartitionDLTEvent): Promise<void> {
    await this.commandBus.execute(
      new CreateBondHoldCommand(
        event.holdId,
        await ConverterUtils.getHederaAddressFromEvm(event.contractId),
        await ConverterUtils.getHederaAddressFromEvm(event.tokenHolder),
        event.partition,
        event.amount,
        new Date(Number(event.expirationTimestamp) * 1000),
        await ConverterUtils.getHederaAddressFromEvm(event.escrow),
        await ConverterUtils.getHederaAddressFromEvm(event.to),
        event.data,
        "",
        await ConverterUtils.getHederaAddressFromEvm(event.operator),
      ),
    )
  }
}
