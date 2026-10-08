// SPDX-License-Identifier: Apache-2.0
import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { SetBondDocumentDomainServiceRequest } from "./model/SetBondDocumentDomainServiceRequest"
import { BondDocument } from "@domain/document/model/BondDocument"
import type { BondDocumentRepository } from "../repository/BondDocumentRepository"
import { CheckBondExistsDomainService } from "@domain/bond/services/CheckBondExistsDomainService"

@Singleton()
export class SetBondDocumentDomainService {
  constructor(
    @Inject() private readonly bondDocumentRepository: BondDocumentRepository,
    private readonly checkBondExistsDomainService: CheckBondExistsDomainService,
  ) {}

  async execute(request: SetBondDocumentDomainServiceRequest): Promise<BondDocument> {
    await this.checkBondExistsDomainService.execute(request.bondContractId)
    const existingBondDocument = await this.bondDocumentRepository.findByContractIdAndName(
      request.bondContractId,
      request.name,
    )

    if (existingBondDocument) {
      existingBondDocument.uri = request.uri
      existingBondDocument.hash = request.hash
      return await this.bondDocumentRepository.save(existingBondDocument)
    }

    const bondDocument = Object.assign(new BondDocument(), {
      bondContractId: request.bondContractId,
      name: request.name,
      uri: request.uri,
      hash: request.hash,
    })
    return await this.bondDocumentRepository.save(bondDocument)
  }
}
