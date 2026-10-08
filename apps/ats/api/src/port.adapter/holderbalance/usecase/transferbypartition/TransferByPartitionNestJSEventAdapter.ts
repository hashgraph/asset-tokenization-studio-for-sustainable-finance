// SPDX-License-Identifier: Apache-2.0

import { ConverterUtils, type CommandBus } from "@hashgraph/green-bonds-shared-core"
import { EventListener, Handler, Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { TransferByPartitionDLTEvent } from "@port/holderbalance/usecase/transferbypartition/model/TransferByPartitionDLTEvent"
import { TransferByPartitionCommand } from "@app/holderbalance/transferbypartition/command/TransferByPartitionCommand"
import { TransferByPartitionPort } from "./TransferByPartitionPort"

const ZERO_EVM_ADDRESS = "0x0000000000000000000000000000000000000000"

@Singleton()
export class TransferByPartitionNestJSEventAdapter
  implements TransferByPartitionPort, EventListener<TransferByPartitionDLTEvent>
{
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Handler(TransferByPartitionDLTEvent)
  async handle(event: TransferByPartitionDLTEvent): Promise<void> {
    const from = event._from.toLowerCase()
    const to = event._to.toLowerCase()
    if (from === ZERO_EVM_ADDRESS || to === ZERO_EVM_ADDRESS || from === to) {
      return
    }

    await this.commandBus.execute(
      new TransferByPartitionCommand(
        event.contractId,
        event._fromPartition,
        await ConverterUtils.getHederaAddressFromEvm(event._from),
        await ConverterUtils.getHederaAddressFromEvm(event._to),
        event._value,
        await ConverterUtils.getHederaAddressFromEvm(event._operator),
      ),
    )
  }
}
