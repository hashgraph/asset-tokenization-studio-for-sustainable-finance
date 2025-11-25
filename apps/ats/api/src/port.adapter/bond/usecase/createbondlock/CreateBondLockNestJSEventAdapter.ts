// SPDX-License-Identifier: Apache-2.0

import { ConverterUtils, type CommandBus } from "@hashgraph/green-bonds-shared-core"
import { EventListener, Handler, Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { LockedByPartitionDLTEvent } from "@port/bond/usecase/createbondlock/model/LockedByPartitionDLTEvent"
import { CreateBondLockCommand } from "@app/bond/createbondlock/command/CreateBondLockCommand"
import { CreateBondLockPort } from "./CreateBondLockPort"

@Singleton()
export class CreateBondLockNestJSEventAdapter implements CreateBondLockPort, EventListener<LockedByPartitionDLTEvent> {
  constructor(@Inject() private readonly commandBus: CommandBus) {}

  @Handler(LockedByPartitionDLTEvent)
  async handle(event: LockedByPartitionDLTEvent): Promise<void> {
    await this.commandBus.execute(
      new CreateBondLockCommand(
        Number(event.lockId),
        event.contractId,
        await ConverterUtils.getHederaAddressFromEvm(event.tokenHolder),
        event.partition,
        event.amount,
        new Date(Number(event.expirationTimestamp) * 1000),
        await ConverterUtils.getHederaAddressFromEvm(event.operator),
      ),
    )
  }
}
