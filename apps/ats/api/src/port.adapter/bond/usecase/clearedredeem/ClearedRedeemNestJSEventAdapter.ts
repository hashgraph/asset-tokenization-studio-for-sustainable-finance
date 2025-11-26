// SPDX-License-Identifier: Apache-2.0
import {
  ConverterUtils,
  type CommandBus,
  EventListener,
  Handler,
  Singleton,
  Inject,
} from "@hashgraph/green-bonds-shared-core"
import { ClearedRedeemByPartitionDLTEvent } from "@port/bond/usecase/clearedredeem/model/ClearedRedeemByPartitionDLTEvent"
import { ClearedRedeemPort } from "@port/bond/usecase/clearedredeem/ClearedRedeemPort"
import { CreateClearingRedeemCommand } from "@app/bond/createclearingredeem/command/CreateClearingRedeemCommand"

@Singleton()
export class ClearedRedeemNestJSEventAdapter
  implements ClearedRedeemPort, EventListener<ClearedRedeemByPartitionDLTEvent>
{
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Handler(ClearedRedeemByPartitionDLTEvent)
  async handle(event: ClearedRedeemByPartitionDLTEvent): Promise<void> {
    await this.commandBus.execute(
      new CreateClearingRedeemCommand(
        event.contractId,
        await ConverterUtils.getHederaAddressFromEvm(event.tokenHolder),
        Number(event.clearingId),
        event.partition,
        event.amount || "0",
        new Date(Number(event.expirationDate) * 1000),
        event.data,
        event.operatorData,
        await ConverterUtils.getHederaAddressFromEvm(event.operator),
      ),
    )
  }
}
