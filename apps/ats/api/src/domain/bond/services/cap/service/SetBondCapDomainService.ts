// SPDX-License-Identifier: Apache-2.0
import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { SetBondCapDomainServiceRequest } from "@domain/bond/services/cap/service/model/SetBondCapDomainServiceRequest"
import { CheckBondExistsDomainService } from "@domain/bond/services/CheckBondExistsDomainService"
import type { BondRepository } from "../../../repositories/BondRepository"

@Singleton()
export class SetBondCapDomainService {
  constructor(
    @Inject() private readonly bondRepository: BondRepository,
    private readonly checkBondExistsDomainService: CheckBondExistsDomainService,
  ) {}

  async execute(request: SetBondCapDomainServiceRequest): Promise<void> {
    const bond = await this.checkBondExistsDomainService.execute(request.bondContractId)

    bond.maxSupply = request.newMaxSupply

    await this.bondRepository.save(bond)
  }
}
