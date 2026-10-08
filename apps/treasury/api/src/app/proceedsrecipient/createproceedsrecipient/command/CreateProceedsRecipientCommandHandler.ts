// SPDX-License-Identifier: Apache-2.0

import { CommandHandler, Handler, Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { EventBus } from "@hashgraph/green-bonds-shared-core"
import { CreateProceedsRecipientCommand } from "@app/proceedsrecipient/createproceedsrecipient/command/CreateProceedsRecipientCommand"
import type { ProceedsRecipientRepository } from "@domain/proceedsrecipient/repositories/ProceedsRecipientRepository"
import { ProceedsRecipient } from "@domain/proceedsrecipient/model/ProceedsRecipient"
import { ProceedsRecipientCreatedEvent } from "@domain/proceedsrecipient/event/ProceedsRecipientCreatedEvent"
import { CheckTreasuryExistsDomainService } from "@domain/treasury/services/CheckTreasuryExistsDomainService"

@Singleton()
@Handler(CreateProceedsRecipientCommand)
export class CreateProceedsRecipientCommandHandler
  implements CommandHandler<CreateProceedsRecipientCommand, ProceedsRecipient>
{
  constructor(
    private readonly checkTreasuryExistsDomainService: CheckTreasuryExistsDomainService,
    @Inject() private readonly proceedsRecipientRepository: ProceedsRecipientRepository,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  @Validate()
  async execute(command: CreateProceedsRecipientCommand): Promise<ProceedsRecipient> {
    const treasury = await this.checkTreasuryExistsDomainService.execute(command.treasuryContractId)

    const proceedsRecipient = await this.proceedsRecipientRepository.save({
      contractId: command.contractId,
      treasuryId: treasury.id,
    } as ProceedsRecipient)

    this.eventBus.publish(new ProceedsRecipientCreatedEvent(proceedsRecipient.id, command.contractId, treasury.id))

    return proceedsRecipient
  }
}
