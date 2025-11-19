// SPDX-License-Identifier: Apache-2.0
import { Handler, Inject, QueryHandler, Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import type { OracleRegistryRepository } from "@domain/oracle/repositories/OracleRegistryRepository"
import { GetOracleRegistryQuery } from "./GetOracleRegistryQuery"
import { OracleRegistryQueryResponse } from "./OracleRegistryQueryResponse"
import { OracleRegistryNotFoundError } from "@domain/oracle/errors/OracleRegistryNotFoundError"

@Singleton()
@Handler(GetOracleRegistryQuery)
export class GetOracleRegistryQueryHandler
  implements QueryHandler<GetOracleRegistryQuery, OracleRegistryQueryResponse>
{
  constructor(@Inject("OracleRegistryRepository") private readonly repository: OracleRegistryRepository) {}

  @Validate()
  async execute(query: GetOracleRegistryQuery): Promise<OracleRegistryQueryResponse> {
    const registry = await this.repository.findById(query.id)
    if (!registry) {
      throw OracleRegistryNotFoundError.idError(query.id)
    }

    return {
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
    }
  }
}
