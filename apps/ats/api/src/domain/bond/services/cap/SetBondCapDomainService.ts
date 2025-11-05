// SPDX-License-Identifier: Apache-2.0
import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { SetBondCapDomainServiceRequest } from "./model/SetBondCapDomainServiceRequest"
import { CheckBondExistsDomainService } from "@domain/bond/services/CheckBondExistsDomainService"
import type { BondRepository } from "../../repositories/BondRepository"

@Singleton()
export class SetBondCapDomainService {
  constructor(
    @Inject() private readonly bondRepository: BondRepository,
    private readonly checkBondExistsDomainService: CheckBondExistsDomainService,
  ) {}

  async execute(request: SetBondCapDomainServiceRequest): Promise<void> {
    const bond = await this.checkBondExistsDomainService.execute(request.contractId)

    bond.maxSupply = request.newMaxSupply

    await this.bondRepository.save(bond)
  }
}
