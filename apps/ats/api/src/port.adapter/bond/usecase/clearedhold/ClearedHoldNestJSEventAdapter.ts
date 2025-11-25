// SPDX-License-Identifier: Apache-2.0
import {
  ConverterUtils,
  type CommandBus,
  EventListener,
  Handler,
  Singleton,
  Inject,
} from "@hashgraph/green-bonds-shared-core"
import { ClearedHoldByPartitionDLTEvent } from "@port/bond/usecase/clearedhold/model/ClearedHoldByPartitionDLTEvent"
import { ClearedHoldPort } from "@port/bond/usecase/clearedhold/ClearedHoldPort"
import { CreateClearingHoldCommand } from "@app/bond/createclearinghold/command/CreateClearingHoldCommand"

@Singleton()
export class ClearedHoldNestJSEventAdapter implements ClearedHoldPort, EventListener<ClearedHoldByPartitionDLTEvent> {
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Handler(ClearedHoldByPartitionDLTEvent)
  async handle(event: ClearedHoldByPartitionDLTEvent): Promise<void> {
    const amount = event.hold.amount || "0"
    const escrow = event.hold.escrow || ""
    const to = event.hold.to || ""

    await this.commandBus.execute(
      new CreateClearingHoldCommand(
        event.contractId,
        await ConverterUtils.getHederaAddressFromEvm(event.tokenHolder),
        Number(event.clearingId),
        event.partition,
        amount,
        new Date(Number(event.expirationDate) * 1000),
        await ConverterUtils.getHederaAddressFromEvm(to),
        await ConverterUtils.getHederaAddressFromEvm(escrow),
        event.data,
        event.operatorData,
        await ConverterUtils.getHederaAddressFromEvm(event.operator),
      ),
    )
  }
}
