// SPDX-License-Identifier: Apache-2.0
import { Inject, NotFoundException } from "@nestjs/common";
import { QueryHandler, IQueryHandler } from "@nestjs/cqrs";
import { GetOracleRegistryQuery } from "./GetOracleRegistryQuery";
import type { OracleRegistryRepository } from "@domain/oracle/repositories/OracleRegistryRepository";
import { OracleRegistry } from "@domain/oracle/model/OracleRegistry";

@QueryHandler(GetOracleRegistryQuery)
export class GetOracleRegistryQueryHandler
  implements IQueryHandler<GetOracleRegistryQuery, OracleRegistry>
{
  constructor(
    @Inject("OracleRegistryRepository")
    private readonly repository: OracleRegistryRepository,
  ) {}

  async execute(query: GetOracleRegistryQuery): Promise<OracleRegistry> {
    const registry = await this.repository.findById(query.id);

    if (!registry) {
      throw new NotFoundException(`Oracle registry ${query.id} not found`);
    }

    return registry;
  }
}
