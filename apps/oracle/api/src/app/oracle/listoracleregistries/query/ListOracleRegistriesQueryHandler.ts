// SPDX-License-Identifier: Apache-2.0
import { Handler, Inject, QueryHandler, QueryPageResponse, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { OracleRegistryRepository } from "@domain/oracle/repositories/OracleRegistryRepository"
import { ListOracleRegistriesQuery } from "./ListOracleRegistriesQuery"
import { OracleRegistryQueryResponse } from "./OracleRegistryQueryResponse"
import { OracleRegistry } from "@domain/oracle/model/OracleRegistry"

@Singleton()
@Handler(ListOracleRegistriesQuery)
export class ListOracleRegistriesQueryHandler
  implements QueryHandler<ListOracleRegistriesQuery, QueryPageResponse<OracleRegistryQueryResponse>>
{
  constructor(@Inject("OracleRegistryRepository") private readonly repository: OracleRegistryRepository) {}

  @Validate()
  async execute(query: ListOracleRegistriesQuery): Promise<QueryPageResponse<OracleRegistryQueryResponse>> {
    const page = await this.repository.findAll(query.pageOptions.toPageOptions())
    return QueryPageResponse.fromPage(page, (registry: OracleRegistry) => ({
      id: registry.id,
      bondContractId: registry.bondContractId,
      kpiContractId: registry.kpiContractId,
      projects: registry.projects.map((p) => ({
        projectId: p.projectId,
        topicId: p.topicId,
      })),
      config: {
        schedulerStartDate: registry.config.schedulerStartDate,
        schedulerEndDate: registry.config.schedulerEndDate,
        frequencyMinutes: registry.config.frequencyMinutes,
      },
      status: registry.status,
      createdAt: registry.createdAt,
      updatedAt: registry.updatedAt,
    }))
  }
}
