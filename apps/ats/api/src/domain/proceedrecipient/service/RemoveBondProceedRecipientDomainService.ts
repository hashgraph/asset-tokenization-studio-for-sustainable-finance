// SPDX-License-Identifier: Apache-2.0
import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { RemoveProceedRecipientCommand } from "@app/proceedrecipient/removeproceedrecipient/command/RemoveProceedRecipientCommand"
import type { BondProceedRecipientRepository } from "../repository/BondProceedRecipientRepository"
import { BondProceedRecipientNotFoundError } from "../errors/BondProceedRecipientNotFoundError"

@Singleton()
export class RemoveBondProceedRecipientDomainService {
  constructor(@Inject() private readonly bondProceedRecipientRepository: BondProceedRecipientRepository) {}

  async execute(req: RemoveProceedRecipientCommand): Promise<void> {
    const recipient = await this.bondProceedRecipientRepository.findByContractIdAndProceedRecipientAddress(
      req.bondContractId,
      req.proceedRecipientAddress,
    )

    if (!recipient) {
      throw BondProceedRecipientNotFoundError.contractIdAndProceedRecipientAddressError(
        req.bondContractId,
        req.proceedRecipientAddress,
      )
    }

    await this.bondProceedRecipientRepository.delete(recipient)
  }
}
