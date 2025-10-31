// SPDX-License-Identifier: Apache-2.0
import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { RemoveBondDocumentDomainServiceRequest } from "./model/RemoveBondDocumentDomainServiceRequest"
import { BondDocument } from "@domain/bond/document/model/BondDocument"
import type { BondDocumentRepository } from "../repository/BondDocumentRepository"
import { CheckBondExistsDomainService } from "@domain/bond/services/CheckBondExistsDomainService"

@Singleton()
export class RemoveBondDocumentDomainService {
  constructor(
    @Inject() private readonly bondDocumentRepository: BondDocumentRepository,
    private readonly checkBondExistsDomainService: CheckBondExistsDomainService,
  ) {}

  async execute(request: RemoveBondDocumentDomainServiceRequest): Promise<void> {
    await this.checkBondExistsDomainService.execute(request.contractId)
    const existingBondDocument = await this.bondDocumentRepository.findByContractIdAndName(
      request.contractId,
      request.name,
    )

    if (!existingBondDocument) {
      throw new Error(`Bond document with name ${request.name} not found for contract ${request.contractId}`)
    }

    await this.bondDocumentRepository.delete(existingBondDocument)
  }
}
