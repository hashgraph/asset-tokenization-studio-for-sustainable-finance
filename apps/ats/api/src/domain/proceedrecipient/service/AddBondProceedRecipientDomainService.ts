// SPDX-License-Identifier: Apache-2.0
import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { AddBondProceedRecipientDomainServiceRequest } from "./model/AddBondProceedRecipientDomainServiceRequest"
import { BondProceedRecipient } from "@domain/proceedrecipient/model/BondProceedRecipient"
import type { BondProceedRecipientRepository } from "../repository/BondProceedRecipientRepository"
import { CheckBondExistsDomainService } from "@domain/bond/services/CheckBondExistsDomainService"
import { BondProceedRecipientFoundError } from "@domain/proceedrecipient/errors/BondProceedRecipientFoundError"

@Singleton()
export class AddBondProceedRecipientDomainService {
  constructor(
    @Inject() private readonly bondProceedRecipientRepository: BondProceedRecipientRepository,
    private readonly checkBondExistsDomainService: CheckBondExistsDomainService,
  ) {}

  async execute(request: AddBondProceedRecipientDomainServiceRequest): Promise<BondProceedRecipient> {
    await this.checkBondExistsDomainService.execute(request.contractId)

    const existingRecipient = await this.bondProceedRecipientRepository.findByContractIdAndProceedRecipientAddress(
      request.contractId,
      request.proceedRecipientAddress,
    )

    if (existingRecipient) {
      throw BondProceedRecipientFoundError.contractIdAndProceedRecipientAddressError(
        request.contractId,
        request.proceedRecipientAddress,
      )
    }

    const recipient = Object.assign(new BondProceedRecipient(), {
      contractId: request.contractId,
      proceedRecipientAddress: request.proceedRecipientAddress,
      data: request.data,
    })
    return await this.bondProceedRecipientRepository.save(recipient)
  }
}
