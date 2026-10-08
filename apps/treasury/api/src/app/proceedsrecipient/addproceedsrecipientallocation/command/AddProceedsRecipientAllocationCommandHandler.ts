// SPDX-License-Identifier: Apache-2.0

import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { AddProceedsRecipientAllocationCommand } from "@app/proceedsrecipient/addproceedsrecipientallocation/command/AddProceedsRecipientAllocationCommand"
import type { ProceedsRecipientAllocationRepository } from "@domain/proceedsrecipient/repositories/ProceedsRecipientAllocationRepository"
import { ProceedsRecipientAllocation } from "@domain/proceedsrecipient/model/ProceedsRecipientAllocation"
import { ProceedsRecipientAllocationAddedEvent } from "@domain/proceedsrecipient/event/ProceedsRecipientAllocationAddedEvent"

@Singleton()
@Handler(AddProceedsRecipientAllocationCommand)
export class AddProceedsRecipientAllocationCommandHandler
  implements CommandHandler<AddProceedsRecipientAllocationCommand, void>
{
  constructor(
    @Inject() private readonly proceedsRecipientAllocationRepository: ProceedsRecipientAllocationRepository,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: AddProceedsRecipientAllocationCommand): Promise<void> {
    await this.proceedsRecipientAllocationRepository.save({
      proceedsRecipientId: command.proceedsRecipientId,
      paymentTokenId: command.paymentTokenId,
      amount: command.amount,
    } as ProceedsRecipientAllocation)

    this.eventBus.publish(
      new ProceedsRecipientAllocationAddedEvent(command.proceedsRecipientId, command.paymentTokenId, command.amount),
    )
  }
}
