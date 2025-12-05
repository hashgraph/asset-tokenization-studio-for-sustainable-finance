// SPDX-License-Identifier: Apache-2.0
import {
  ConverterUtils,
  type CommandBus,
  EventListener,
  Handler,
  Singleton,
  Inject,
} from "@hashgraph/green-bonds-shared-core"
import { ClearedTransferByPartitionDLTEvent } from "@port/clearing/usecase/clearedtransfer/model/ClearedTransferByPartitionDLTEvent"
import { ClearedTransferPort } from "@port/clearing/usecase/clearedtransfer/ClearedTransferPort"
import { CreateClearingTransferCommand } from "@app/clearing/createclearingtransfer/command/CreateClearingTransferCommand"

@Singleton()
export class ClearedTransferNestJSEventAdapter
  implements ClearedTransferPort, EventListener<ClearedTransferByPartitionDLTEvent>
{
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Handler(ClearedTransferByPartitionDLTEvent)
  async handle(event: ClearedTransferByPartitionDLTEvent): Promise<void> {
    await this.commandBus.execute(
      new CreateClearingTransferCommand(
        event.contractId,
        await ConverterUtils.getHederaAddressFromEvm(event.tokenHolder),
        Number(event.clearingId),
        event.partition,
        event.amount || "0",
        new Date(Number(event.expirationDate) * 1000),
        await ConverterUtils.getHederaAddressFromEvm(event.to),
        event.data,
        event.operatorData,
        await ConverterUtils.getHederaAddressFromEvm(event.operator),
      ),
    )
  }
}
