// SPDX-License-Identifier: Apache-2.0
import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { plainToInstance } from "class-transformer"
import { Page, PageOptions } from "@hashgraph/green-bonds-shared-core"
import type { OracleRegistryRepository } from "@domain/oracle/repositories/OracleRegistryRepository"
import { OracleRegistry } from "@domain/oracle/model/OracleRegistry"
import { OracleRegistryPersistence } from "../model/OracleRegistryPersistence"
import { OracleStatus } from "@domain/oracle/model/OracleStatus"

@Injectable()
export class OracleRegistryTypeOrmRepository implements OracleRegistryRepository {
  constructor(
    @InjectRepository(OracleRegistryPersistence)
    private readonly repository: Repository<OracleRegistryPersistence>,
  ) {}

  async save(registry: OracleRegistry): Promise<OracleRegistry> {
    const persistence = await this.repository.save(registry as unknown as OracleRegistryPersistence)
    return this.toDomain(persistence)!
  }

  async findById(id: string): Promise<OracleRegistry | null> {
    const persistence = await this.repository.findOne({ where: { id } })
    return this.toDomain(persistence)
  }

  async findByKpiContractId(kpiContractId: string): Promise<OracleRegistry | null> {
    const persistence = await this.repository.findOne({ where: { kpiContractId } })
    return this.toDomain(persistence)
  }

  async findAll(options: PageOptions): Promise<Page<OracleRegistry>> {
    const orderDirection = options.order.order.toUpperCase() as "ASC" | "DESC"
    const [persistences, total] = await this.repository.findAndCount({
      order: { [options.order.orderBy]: orderDirection },
      take: options.limit,
      skip: (options.page - 1) * options.limit,
    })

    const items = persistences.map((p) => this.toDomain(p)!)

    return {
      items,
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit),
    }
  }

  async findActiveForExecution(): Promise<OracleRegistry[]> {
    const now = new Date()
    const persistences = await this.repository
      .createQueryBuilder("registry")
      .where("registry.status = :status", { status: OracleStatus.ACTIVE })
      .andWhere("registry.nextExecutionDate <= :now", { now })
      .andWhere("registry.schedulerStartDate <= :now", { now })
      .andWhere("(registry.schedulerEndDate IS NULL OR registry.schedulerEndDate >= :now)", { now })
      .getMany()

    return persistences.map((p) => this.toDomain(p)!)
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id)
  }

  private toDomain(persistence: OracleRegistryPersistence | null): OracleRegistry | null {
    return persistence ? plainToInstance(OracleRegistry, persistence) : null
  }
}
