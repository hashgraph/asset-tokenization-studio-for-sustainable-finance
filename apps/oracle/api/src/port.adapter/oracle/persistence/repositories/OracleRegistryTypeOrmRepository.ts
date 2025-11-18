// SPDX-License-Identifier: Apache-2.0
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import type { OracleRegistryRepository } from "@domain/oracle/repositories/OracleRegistryRepository";
import { OracleRegistry } from "@domain/oracle/model/OracleRegistry";
import { OracleRegistryPersistence } from "../model/OracleRegistryPersistence";
import { OracleRegistryMapper } from "../OracleRegistryMapper";
import { OracleStatus } from "@domain/oracle/model/OracleStatus";

@Injectable()
export class OracleRegistryTypeOrmRepository implements OracleRegistryRepository {
  constructor(
    @InjectRepository(OracleRegistryPersistence)
    private readonly repository: Repository<OracleRegistryPersistence>,
  ) {}

  async save(registry: OracleRegistry): Promise<OracleRegistry> {
    const entity = OracleRegistryMapper.toEntity(registry);
    const saved = await this.repository.save(entity);
    return OracleRegistryMapper.toDomain(saved);
  }

  async findById(id: string): Promise<OracleRegistry | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? OracleRegistryMapper.toDomain(entity) : null;
  }

  async findByKpiContractId(
    kpiContractId: string,
  ): Promise<OracleRegistry | null> {
    const entity = await this.repository.findOne({ where: { kpiContractId } });
    return entity ? OracleRegistryMapper.toDomain(entity) : null;
  }

  async findAll(page: number, limit: number): Promise<OracleRegistry[]> {
    const entities = await this.repository.find({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: "DESC" },
    });
    return entities.map(OracleRegistryMapper.toDomain);
  }

  async findActiveForExecution(): Promise<OracleRegistry[]> {
    const now = new Date();

    const entities = await this.repository
      .createQueryBuilder("registry")
      .where("registry.status = :status", { status: OracleStatus.ACTIVE })
      .andWhere("registry.nextExecutionDate <= :now", { now })
      .andWhere("registry.schedulerStartDate <= :now", { now })
      .andWhere(
        "(registry.schedulerEndDate IS NULL OR registry.schedulerEndDate >= :now)",
        { now },
      )
      .getMany();

    return entities.map(OracleRegistryMapper.toDomain);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async count(): Promise<number> {
    return await this.repository.count();
  }
}
