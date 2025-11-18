// SPDX-License-Identifier: Apache-2.0
import { OracleRegistry } from "@domain/oracle/model/OracleRegistry";
import { OracleRegistryPersistence } from "./model/OracleRegistryPersistence";
import { Project } from "@domain/oracle/model/Project";
import { OracleConfig } from "@domain/oracle/model/OracleConfig";
import { OracleStatus } from "@domain/oracle/model/OracleStatus";

export class OracleRegistryMapper {
  static toDomain(entity: OracleRegistryPersistence): OracleRegistry {
    const projects = entity.projects.map(
      (p) => new Project(p.projectId, p.topicId),
    );

    const config = new OracleConfig(
      entity.schedulerStartDate,
      entity.schedulerEndDate,
      entity.nextExecutionDate,
      entity.frequencyMinutes,
    );

    return new OracleRegistry(
      entity.id,
      entity.bondId,
      entity.kpiContractId,
      projects,
      config,
      entity.status as OracleStatus,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static toEntity(domain: OracleRegistry): OracleRegistryPersistence {
    const entity = new OracleRegistryPersistence();
    entity.id = domain.id;
    entity.bondId = domain.bondId;
    entity.kpiContractId = domain.kpiContractId;
    entity.projects = domain.projects.map((p) => p.toJSON());
    entity.schedulerStartDate = domain.config.schedulerStartDate;
    entity.schedulerEndDate = domain.config.schedulerEndDate;
    entity.nextExecutionDate = domain.config.nextExecutionDate;
    entity.frequencyMinutes = domain.config.frequencyMinutes;
    entity.status = domain.status;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
