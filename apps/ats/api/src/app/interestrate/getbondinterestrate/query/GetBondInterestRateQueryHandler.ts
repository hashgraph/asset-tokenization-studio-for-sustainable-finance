// SPDX-License-Identifier: Apache-2.0
import { Handler, Inject, QueryHandler, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import { CheckBondExistsDomainService } from "@domain/bond/services/CheckBondExistsDomainService"
import type { BondInterestRateRepository } from "@domain/interestrate/repository/BondInterestRateRepository"
import { GetBondInterestRateQuery } from "./GetBondInterestRateQuery"
import { GetBondInterestRateQueryResponse } from "./GetBondInterestRateQueryResponse"
import { BondInterestRateNotFoundError } from "@domain/interestrate/errors/BondInterestRateNotFoundError"

@Singleton()
@Handler(GetBondInterestRateQuery)
export class GetBondInterestRateQueryHandler
  implements QueryHandler<GetBondInterestRateQuery, GetBondInterestRateQueryResponse>
{
  constructor(
    private readonly checkBondExistsDomainService: CheckBondExistsDomainService,
    @Inject() private readonly bondInterestRateRepository: BondInterestRateRepository,
  ) {}

  @Validate()
  async execute(query: GetBondInterestRateQuery): Promise<GetBondInterestRateQueryResponse> {
    await this.checkBondExistsDomainService.execute(query.bondContractId)

    const interestRate = await this.bondInterestRateRepository.findByContractId(query.bondContractId)

    if (!interestRate) {
      throw BondInterestRateNotFoundError.bondContractIdError(query.bondContractId)
    }

    return {
      id: interestRate.id,
      bondContractId: interestRate.bondContractId,
      operator: interestRate.operator,
      maxRate: interestRate.maxRate,
      baseRate: interestRate.baseRate,
      minRate: interestRate.minRate,
      startPeriod: interestRate.startPeriod,
      startRate: interestRate.startRate,
      missedPenalty: interestRate.missedPenalty,
      reportPeriod: interestRate.reportPeriod,
      rateDecimals: interestRate.rateDecimals,
      createdAt: interestRate.createdAt,
      updatedAt: interestRate.updatedAt,
    }
  }
}
