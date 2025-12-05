// SPDX-License-Identifier: Apache-2.0
import {
  ConverterUtils,
  type CommandBus,
  EventListener,
  Handler,
  Singleton,
  Inject,
} from "@hashgraph/green-bonds-shared-core"
import { HoldByPartitionReleasedDLTEvent } from "@port/hold/usecase/releasedholdbypartition/model/HoldByPartitionReleasedDLTEvent"
import { ReleasedHoldByPartitionPort } from "@port/hold/usecase/releasedholdbypartition/ReleasedHoldByPartitionPort"
import { ReleaseBondHoldCommand } from "@app/hold/releasebondhold/command/ReleaseBondHoldCommand"

@Singleton()
export class ReleasedHoldByPartitionNestJSEventAdapter
  implements ReleasedHoldByPartitionPort, EventListener<HoldByPartitionReleasedDLTEvent>
{
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Handler(HoldByPartitionReleasedDLTEvent)
  async handle(event: HoldByPartitionReleasedDLTEvent): Promise<void> {
    await this.commandBus.execute(
      new ReleaseBondHoldCommand(
        event.contractId,
        await ConverterUtils.getHederaAddressFromEvm(event.tokenHolder),
        Number(event.holdId),
        event.partition,
        event.amount,
      ),
    )
  }
}
