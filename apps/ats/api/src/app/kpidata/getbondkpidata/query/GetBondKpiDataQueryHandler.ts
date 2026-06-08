// SPDX-License-Identifier: Apache-2.0
import {
  Handler,
  Inject,
  QueryHandler,
  QueryPageResponse,
  Singleton,
  Validate,
} from "@hashgraph/green-bonds-shared-core"
import { CheckBondExistsDomainService } from "@domain/bond/services/CheckBondExistsDomainService"
import type { BondKpiDataRepository } from "@domain/kpidata/repository/BondKpiDataRepository"
import { GetBondKpiDataQuery } from "./GetBondKpiDataQuery"
import { BondKpiDataQueryResponse } from "./BondKpiDataQueryResponse"
import { BondKpiData } from "@domain/kpidata/model/BondKpiData"

@Singleton()
@Handler(GetBondKpiDataQuery)
export class GetBondKpiDataQueryHandler
  implements QueryHandler<GetBondKpiDataQuery, QueryPageResponse<BondKpiDataQueryResponse>>
{
  constructor(
    private readonly checkBondExistsDomainService: CheckBondExistsDomainService,
    @Inject() private readonly bondKpiDataRepository: BondKpiDataRepository,
  ) {}

  @Validate()
  async execute(query: GetBondKpiDataQuery): Promise<QueryPageResponse<BondKpiDataQueryResponse>> {
    await this.checkBondExistsDomainService.execute(query.bondContractId)

    const page = await this.bondKpiDataRepository.findAllByContractId(
      query.bondContractId,
      query.pageOptions.toPageOptions(),
    )

    return QueryPageResponse.fromPage(page, (item: BondKpiData) => ({
      id: item.id,
      bondContractId: item.bondContractId,
      project: item.project,
      date: item.date,
      value: item.value,
      createdAt: item.createdAt,
    }))
  }
}
