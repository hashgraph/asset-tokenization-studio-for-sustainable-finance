// SPDX-License-Identifier: Apache-2.0
import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { RemoveBondDocumentDomainServiceRequest } from "./model/RemoveBondDocumentDomainServiceRequest"
import type { BondDocumentRepository } from "../repository/BondDocumentRepository"
import { CheckBondExistsDomainService } from "@domain/bond/services/CheckBondExistsDomainService"
import { BondDocumentNotFoundError } from "../errors/BondDocumentNotFoundError"

@Singleton()
export class RemoveBondDocumentDomainService {
  constructor(
    @Inject() private readonly bondDocumentRepository: BondDocumentRepository,
    private readonly checkBondExistsDomainService: CheckBondExistsDomainService,
  ) {}

  async execute(request: RemoveBondDocumentDomainServiceRequest): Promise<void> {
    await this.checkBondExistsDomainService.execute(request.bondContractId)
    const existingBondDocument = await this.bondDocumentRepository.findByContractIdAndName(
      request.bondContractId,
      request.name,
    )

    if (!existingBondDocument) {
      throw BondDocumentNotFoundError.contractIdNameError(request.bondContractId, request.name)
    }

    await this.bondDocumentRepository.delete(existingBondDocument)
  }
}
