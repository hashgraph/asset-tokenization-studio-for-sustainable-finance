// SPDX-License-Identifier: Apache-2.0
import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { SetBondImpactDataDomainServiceRequest } from "./model/SetBondImpactDataDomainServiceRequest"
import { BondImpactData } from "@domain/impactdata/model/BondImpactData"
import type { BondImpactDataRepository } from "@domain/impactdata/repository/BondImpactDataRepository"
import { CheckBondExistsDomainService } from "@domain/bond/services/CheckBondExistsDomainService"

@Singleton()
export class SetBondImpactDataDomainService {
  constructor(
    @Inject() private readonly bondImpactDataRepository: BondImpactDataRepository,
    private readonly checkBondExistsDomainService: CheckBondExistsDomainService,
  ) {}

  async execute(request: SetBondImpactDataDomainServiceRequest): Promise<BondImpactData> {
    await this.checkBondExistsDomainService.execute(request.bondContractId)

    const existing = await this.bondImpactDataRepository.findByContractId(request.bondContractId)

    const impactData = Object.assign(existing ?? new BondImpactData(), {
      bondContractId: request.bondContractId,
      operator: request.operator,
      maxDeviationCap: request.maxDeviationCap,
      baseLine: request.baseLine,
      maxDeviationFloor: request.maxDeviationFloor,
      impactDataDecimals: request.impactDataDecimals,
      adjustmentPrecision: request.adjustmentPrecision,
    })

    return await this.bondImpactDataRepository.save(impactData)
  }
}
