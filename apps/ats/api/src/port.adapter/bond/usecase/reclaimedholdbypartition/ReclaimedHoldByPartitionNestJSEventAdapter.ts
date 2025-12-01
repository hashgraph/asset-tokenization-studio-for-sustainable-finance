// SPDX-License-Identifier: Apache-2.0
import {
  ConverterUtils,
  type CommandBus,
  EventListener,
  Handler,
  Singleton,
  Inject,
} from "@hashgraph/green-bonds-shared-core"
import { HoldByPartitionReclaimedDLTEvent } from "@port/bond/usecase/reclaimedholdbypartition/model/HoldByPartitionReclaimedDLTEvent"
import { ReclaimedHoldByPartitionPort } from "@port/bond/usecase/reclaimedholdbypartition/ReclaimedHoldByPartitionPort"
import { ReclaimBondHoldCommand } from "@app/bond/reclaimbondhold/command/ReclaimBondHoldCommand"

@Singleton()
export class ReclaimedHoldByPartitionNestJSEventAdapter
  implements ReclaimedHoldByPartitionPort, EventListener<HoldByPartitionReclaimedDLTEvent>
{
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Handler(HoldByPartitionReclaimedDLTEvent)
  async handle(event: HoldByPartitionReclaimedDLTEvent): Promise<void> {
    await this.commandBus.execute(
      new ReclaimBondHoldCommand(
        event.contractId,
        await ConverterUtils.getHederaAddressFromEvm(event.tokenHolder),
        Number(event.holdId),
        event.partition,
        event.amount,
      ),
    )
  }
}
