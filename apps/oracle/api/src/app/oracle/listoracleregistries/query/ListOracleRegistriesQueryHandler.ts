// SPDX-License-Identifier: Apache-2.0
import { Inject } from "@nestjs/common";
import { QueryHandler, IQueryHandler } from "@nestjs/cqrs";
import { ListOracleRegistriesQuery } from "./ListOracleRegistriesQuery";
import type { OracleRegistryRepository } from "@domain/oracle/repositories/OracleRegistryRepository";
import { OracleRegistry } from "@domain/oracle/model/OracleRegistry";

export interface ListOracleRegistriesResponse {
  data: OracleRegistry[];
  total: number;
  page: number;
  limit: number;
}

@QueryHandler(ListOracleRegistriesQuery)
export class ListOracleRegistriesQueryHandler
  implements IQueryHandler<ListOracleRegistriesQuery, ListOracleRegistriesResponse>
{
  constructor(
    @Inject("OracleRegistryRepository")
    private readonly repository: OracleRegistryRepository,
  ) {}

  async execute(
    query: ListOracleRegistriesQuery,
  ): Promise<ListOracleRegistriesResponse> {
    const [data, total] = await Promise.all([
      this.repository.findAll(query.page, query.limit),
      this.repository.count(),
    ]);

    return {
      data,
      total,
      page: query.page,
      limit: query.limit,
    };
  }
}
