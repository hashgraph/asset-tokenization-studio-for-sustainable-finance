// SPDX-License-Identifier: Apache-2.0
import { ConflictException } from "@nestjs/common";
import {
  Singleton,
  Handler,
  Validate,
  CommandHandler as ICommandHandler,
  Logger,
} from "@hashgraph/green-bonds-shared-core";
import { CreateOracleRegistryCommand } from "./CreateOracleRegistryCommand";
import type { OracleRegistryRepository } from "@domain/oracle/repositories/OracleRegistryRepository";
import { OracleRegistry } from "@domain/oracle/model/OracleRegistry";
import { Project } from "@domain/oracle/model/Project";
import { randomUUID } from "crypto";

@Singleton()
@Handler(CreateOracleRegistryCommand)
export class CreateOracleRegistryCommandHandler
  implements ICommandHandler<CreateOracleRegistryCommand, OracleRegistry>
{
  private readonly logger = new Logger(CreateOracleRegistryCommandHandler.name);

  constructor(
    private readonly repository: OracleRegistryRepository,
  ) {}

  @Validate()
  async execute(command: CreateOracleRegistryCommand): Promise<OracleRegistry> {
    this.logger.log(
      `Creating oracle registry for bond ${command.bondId} with KPI contract ${command.kpiContractId}`,
    );

    // Check if KPI contract already has an oracle registry
    const existing = await this.repository.findByKpiContractId(
      command.kpiContractId,
    );
    if (existing) {
      throw new ConflictException(
        `Oracle registry already exists for KPI contract ${command.kpiContractId}`,
      );
    }

    // Create projects
    const projects = command.projects.map(
      (p) => new Project(p.projectId, p.topicId),
    );

    // Create registry
    const registry = OracleRegistry.create(
      randomUUID(),
      command.bondId,
      command.kpiContractId,
      projects,
      command.schedulerStartDate,
      command.schedulerEndDate,
      command.frequencyMinutes,
    );

    // Save
    const saved = await this.repository.save(registry);

    this.logger.log(`Oracle registry created with ID: ${saved.id}`);

    return saved;
  }
}
