// SPDX-License-Identifier: Apache-2.0
import { Handler, Inject, QueryHandler, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import { CheckBondExistsDomainService } from "@domain/bond/services/CheckBondExistsDomainService"
import type { BondImpactDataRepository } from "@domain/impactdata/repository/BondImpactDataRepository"
import { GetBondImpactDataQuery } from "./GetBondImpactDataQuery"
import { GetBondImpactDataQueryResponse } from "./GetBondImpactDataQueryResponse"
import { BondImpactDataNotFoundError } from "@domain/impactdata/errors/BondImpactDataNotFoundError"

@Singleton()
@Handler(GetBondImpactDataQuery)
export class GetBondImpactDataQueryHandler
  implements QueryHandler<GetBondImpactDataQuery, GetBondImpactDataQueryResponse>
{
  constructor(
    private readonly checkBondExistsDomainService: CheckBondExistsDomainService,
    @Inject() private readonly bondImpactDataRepository: BondImpactDataRepository,
  ) {}

  @Validate()
  async execute(query: GetBondImpactDataQuery): Promise<GetBondImpactDataQueryResponse> {
    await this.checkBondExistsDomainService.execute(query.bondContractId)

    const impactData = await this.bondImpactDataRepository.findByContractId(query.bondContractId)

    if (!impactData) {
      throw BondImpactDataNotFoundError.bondContractIdError(query.bondContractId)
    }

    return {
      id: impactData.id,
      bondContractId: impactData.bondContractId,
      operator: impactData.operator,
      maxDeviationCap: impactData.maxDeviationCap,
      baseLine: impactData.baseLine,
      maxDeviationFloor: impactData.maxDeviationFloor,
      impactDataDecimals: impactData.impactDataDecimals,
      adjustmentPrecision: impactData.adjustmentPrecision,
      createdAt: impactData.createdAt,
      updatedAt: impactData.updatedAt,
    }
  }
}
