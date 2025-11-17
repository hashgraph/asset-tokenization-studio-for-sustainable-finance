// SPDX-License-Identifier: Apache-2.0
import {
  ConverterUtils,
  type CommandBus,
  EventListener,
  Handler,
  Singleton,
  Inject,
} from "@hashgraph/green-bonds-shared-core"
import { ClearedRedeemFromByPartitionDLTEvent } from "@port/bond/usecase/clearedredeem/model/ClearedRedeemFromByPartitionDLTEvent"
import { ClearedRedeemPort } from "@port/bond/usecase/clearedredeem/ClearedRedeemPort"
import { CreateClearingRedeemCommand } from "@app/bond/createclearingredeem/command/CreateClearingRedeemCommand"

@Singleton()
export class ClearedRedeemNestJSEventAdapter
  implements ClearedRedeemPort, EventListener<ClearedRedeemFromByPartitionDLTEvent>
{
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Handler(ClearedRedeemFromByPartitionDLTEvent)
  async handle(event: ClearedRedeemFromByPartitionDLTEvent): Promise<void> {
    await this.commandBus.execute(
      new CreateClearingRedeemCommand(
        await ConverterUtils.getHederaAddressFromEvm(event.contractId),
        await ConverterUtils.getHederaAddressFromEvm(event.tokenHolder),
        event.clearingId,
        event.partition,
        event.amount,
        new Date(event.expirationDate * 1000),
        event.data,
        event.operatorData,
        await ConverterUtils.getHederaAddressFromEvm(event.operator),
      ),
    )
  }
}
