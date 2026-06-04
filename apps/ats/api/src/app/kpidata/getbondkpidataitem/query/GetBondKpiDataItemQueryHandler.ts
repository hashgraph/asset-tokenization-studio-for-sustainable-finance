// SPDX-License-Identifier: Apache-2.0
import { Handler, Inject, QueryHandler, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import { CheckBondExistsDomainService } from "@domain/bond/services/CheckBondExistsDomainService"
import type { BondKpiDataRepository } from "@domain/kpidata/repository/BondKpiDataRepository"
import { GetBondKpiDataItemQuery } from "./GetBondKpiDataItemQuery"
import { GetBondKpiDataItemQueryResponse } from "./GetBondKpiDataItemQueryResponse"
import { BondKpiDataNotFoundError } from "@domain/kpidata/errors/BondKpiDataNotFoundError"

@Singleton()
@Handler(GetBondKpiDataItemQuery)
export class GetBondKpiDataItemQueryHandler
  implements QueryHandler<GetBondKpiDataItemQuery, GetBondKpiDataItemQueryResponse>
{
  constructor(
    private readonly checkBondExistsDomainService: CheckBondExistsDomainService,
    @Inject() private readonly bondKpiDataRepository: BondKpiDataRepository,
  ) {}

  @Validate()
  async execute(query: GetBondKpiDataItemQuery): Promise<GetBondKpiDataItemQueryResponse> {
    await this.checkBondExistsDomainService.execute(query.bondContractId)

    const item = await this.bondKpiDataRepository.findByContractIdAndId(query.bondContractId, query.kpiDataId)

    if (!item) {
      throw BondKpiDataNotFoundError.kpiDataIdError(query.bondContractId, query.kpiDataId)
    }

    return {
      id: item.id,
      bondContractId: item.bondContractId,
      project: item.project,
      date: item.date,
      value: item.value,
      createdAt: item.createdAt,
    }
  }
}
