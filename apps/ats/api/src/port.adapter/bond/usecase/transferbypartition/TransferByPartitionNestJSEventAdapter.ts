// SPDX-License-Identifier: Apache-2.0

import { ConverterUtils, type CommandBus } from "@hashgraph/green-bonds-shared-core"
import { EventListener, Handler, Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { TransferByPartitionDLTEvent } from "@port/bond/usecase/transferbypartition/model/TransferByPartitionDLTEvent"
import { TransferByPartitionCommand } from "@app/bond/transferbypartition/command/TransferByPartitionCommand"
import { TransferByPartitionPort } from "./TransferByPartitionPort"

@Singleton()
export class TransferByPartitionNestJSEventAdapter
  implements TransferByPartitionPort, EventListener<TransferByPartitionDLTEvent>
{
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Handler(TransferByPartitionDLTEvent)
  async handle(event: TransferByPartitionDLTEvent): Promise<void> {
    await this.commandBus.execute(
      new TransferByPartitionCommand(
        await ConverterUtils.getHederaAddressFromEvm(event.contractId),
        event._fromPartition,
        await ConverterUtils.getHederaAddressFromEvm(event._from),
        await ConverterUtils.getHederaAddressFromEvm(event._to),
        event._value,
        await ConverterUtils.getHederaAddressFromEvm(event._operator),
      ),
    )
  }
}
