// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { CommandBus } from "@hashgraph/green-bonds-shared-core"
import { SyncProceedsRecipientAppServiceRequest } from "@app/proceedsrecipient/syncproceedsrecipient/service/model/SyncProceedsRecipientAppServiceRequest"
import type { ProceedsRecipientRepository } from "@domain/proceedsrecipient/repositories/ProceedsRecipientRepository"
import { ProceedsRecipient } from "@domain/proceedsrecipient/model/ProceedsRecipient"
import { CreateProceedsRecipientCommand } from "@app/proceedsrecipient/createproceedsrecipient/command/CreateProceedsRecipientCommand"
import { AddProceedsRecipientAllocationCommand } from "@app/proceedsrecipient/addproceedsrecipientallocation/command/AddProceedsRecipientAllocationCommand"

@Singleton()
export class SyncProceedsRecipientAppService {
  constructor(
    @Inject() private readonly proceedsRecipientRepository: ProceedsRecipientRepository,
    @Inject() private readonly commandBus: CommandBus,
  ) {}

  @Validate()
  async execute(request: SyncProceedsRecipientAppServiceRequest): Promise<void> {
    // Check if the proceeds recipient exists for this treasury
    const existingProceedsRecipient = await this.proceedsRecipientRepository.findByContractIdAndTreasuryContractId(
      request.proceedsRecipientContractId,
      request.treasuryContractId,
    )

    let proceedsRecipientId: string

    if (!existingProceedsRecipient) {
      // Create a new proceeds recipient
      const proceedsRecipient = (await this.commandBus.execute(
        new CreateProceedsRecipientCommand(request.proceedsRecipientContractId, request.treasuryContractId),
      )) as ProceedsRecipient
      proceedsRecipientId = proceedsRecipient.id
    } else {
      proceedsRecipientId = existingProceedsRecipient.id
    }

    await this.commandBus.execute(new AddProceedsRecipientAllocationCommand(proceedsRecipientId, request.amount))
  }
}
