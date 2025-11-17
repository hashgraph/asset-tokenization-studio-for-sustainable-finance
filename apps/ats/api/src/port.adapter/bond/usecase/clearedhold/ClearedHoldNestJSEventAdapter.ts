// SPDX-License-Identifier: Apache-2.0
import { ConverterUtils, type CommandBus, EventListener, Handler, Singleton, Inject } from "@hashgraph/green-bonds-shared-core"
import { ClearedHoldByPartitionDLTEvent } from "@port/bond/usecase/clearedhold/model/ClearedHoldByPartitionDLTEvent"
import { ClearedHoldPort } from "@port/bond/usecase/clearedhold/ClearedHoldPort"
import { CreateClearingHoldCommand } from "@app/bond/createclearinghold/command/CreateClearingHoldCommand"

@Singleton()
export class ClearedHoldNestJSEventAdapter implements ClearedHoldPort, EventListener<ClearedHoldByPartitionDLTEvent> {
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Handler(ClearedHoldByPartitionDLTEvent)
  async handle(event: ClearedHoldByPartitionDLTEvent): Promise<void> {
    await this.commandBus.execute(
      new CreateClearingHoldCommand(
        await ConverterUtils.getHederaAddressFromEvm(event.contractId),
        await ConverterUtils.getHederaAddressFromEvm(event.tokenHolder),
        event.clearingId,
        event.partition,
        event.amount,
        new Date(event.expirationDate * 1000),
        await ConverterUtils.getHederaAddressFromEvm(event.toAddress),
        await ConverterUtils.getHederaAddressFromEvm(event.escrowAddress),
        event.data,
        event.operatorData,
        await ConverterUtils.getHederaAddressFromEvm(event.operator),
      ),
    )
  }
}
