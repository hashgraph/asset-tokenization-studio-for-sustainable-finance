// SPDX-License-Identifier: Apache-2.0

import { ConverterUtils, type CommandBus } from "@hashgraph/green-bonds-shared-core"
import { EventListener, Handler, Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { LockByPartitionReleasedDLTEvent } from "@port/bond/usecase/releasebondlock/model/LockByPartitionReleasedDLTEvent"
import { ReleaseBondLockCommand } from "@app/bond/releasebondlock/command/ReleaseBondLockCommand"
import { ReleaseBondLockPort } from "./ReleaseBondLockPort"

@Singleton()
export class ReleaseBondLockNestJSEventAdapter
  implements ReleaseBondLockPort, EventListener<LockByPartitionReleasedDLTEvent>
{
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Handler(LockByPartitionReleasedDLTEvent)
  async handle(event: LockByPartitionReleasedDLTEvent): Promise<void> {
    await this.commandBus.execute(
      new ReleaseBondLockCommand(
        event.lockId,
        await ConverterUtils.getHederaAddressFromEvm(event.contractId),
        await ConverterUtils.getHederaAddressFromEvm(event.tokenHolder),
        event.partition,
        await ConverterUtils.getHederaAddressFromEvm(event.operator),
      ),
    )
  }
}
