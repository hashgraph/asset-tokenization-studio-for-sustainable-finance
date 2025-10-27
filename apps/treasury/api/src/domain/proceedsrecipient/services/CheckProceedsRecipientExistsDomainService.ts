// SPDX-License-Identifier: Apache-2.0

import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { ProceedsRecipient } from "@domain/proceedsrecipient/model/ProceedsRecipient"
import type { ProceedsRecipientRepository } from "@domain/proceedsrecipient/repositories/ProceedsRecipientRepository"
import { ProceedsRecipientNotFoundError } from "@domain/proceedsrecipient/errors/ProceedsRecipientNotFoundError"

@Singleton()
export class CheckProceedsRecipientExistsDomainService {
  constructor(
    @Inject("ProceedsRecipientRepository") private readonly proceedsRecipientRepository: ProceedsRecipientRepository,
  ) {}

  async execute(contractId: string, treasuryContractId: string): Promise<ProceedsRecipient> {
    const proceedsRecipient = await this.proceedsRecipientRepository.findByContractIdAndTreasuryContractId(
      contractId,
      treasuryContractId,
    )
    if (!proceedsRecipient) {
      throw ProceedsRecipientNotFoundError.contractIdError(contractId)
    }

    return proceedsRecipient
  }
}
