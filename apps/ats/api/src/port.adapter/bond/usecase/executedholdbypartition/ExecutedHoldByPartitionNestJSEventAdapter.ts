// SPDX-License-Identifier: Apache-2.0
import {
  ConverterUtils,
  type CommandBus,
  EventListener,
  Handler,
  Singleton,
  Inject,
} from "@hashgraph/green-bonds-shared-core"
import { HoldByPartitionExecutedDLTEvent } from "@port/bond/usecase/executedholdbypartition/model/HoldByPartitionExecutedDLTEvent"
import { ExecutedHoldByPartitionPort } from "@port/bond/usecase/executedholdbypartition/ExecutedHoldByPartitionPort"
import { ExecuteBondHoldCommand } from "@app/bond/executebondhold/command/ExecuteBondHoldCommand"

@Singleton()
export class ExecutedHoldByPartitionNestJSEventAdapter
  implements ExecutedHoldByPartitionPort, EventListener<HoldByPartitionExecutedDLTEvent>
{
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Handler(HoldByPartitionExecutedDLTEvent)
  async handle(event: HoldByPartitionExecutedDLTEvent): Promise<void> {
    await this.commandBus.execute(
      new ExecuteBondHoldCommand(
        await ConverterUtils.getHederaAddressFromEvm(event.contractId),
        await ConverterUtils.getHederaAddressFromEvm(event.tokenHolder),
        Number(event.holdId),
        event.partition,
        event.amount,
        await ConverterUtils.getHederaAddressFromEvm(event.to),
      ),
    )
  }
}
