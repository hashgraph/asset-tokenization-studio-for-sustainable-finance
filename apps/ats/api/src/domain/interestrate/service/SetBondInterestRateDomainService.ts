// SPDX-License-Identifier: Apache-2.0
import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import { SetBondInterestRateDomainServiceRequest } from "./model/SetBondInterestRateDomainServiceRequest"
import { BondInterestRate } from "@domain/interestrate/model/BondInterestRate"
import type { BondInterestRateRepository } from "@domain/interestrate/repository/BondInterestRateRepository"
import { CheckBondExistsDomainService } from "@domain/bond/services/CheckBondExistsDomainService"

@Singleton()
export class SetBondInterestRateDomainService {
  constructor(
    @Inject() private readonly bondInterestRateRepository: BondInterestRateRepository,
    private readonly checkBondExistsDomainService: CheckBondExistsDomainService,
  ) {}

  async execute(request: SetBondInterestRateDomainServiceRequest): Promise<BondInterestRate> {
    await this.checkBondExistsDomainService.execute(request.bondContractId)

    const existing = await this.bondInterestRateRepository.findByContractId(request.bondContractId)

    const interestRate = Object.assign(existing ?? new BondInterestRate(), {
      bondContractId: request.bondContractId,
      operator: request.operator,
      maxRate: request.maxRate,
      baseRate: request.baseRate,
      minRate: request.minRate,
      startPeriod: request.startPeriod,
      startRate: request.startRate,
      missedPenalty: request.missedPenalty,
      reportPeriod: request.reportPeriod,
      rateDecimals: request.rateDecimals,
    })

    return await this.bondInterestRateRepository.save(interestRate)
  }
}
