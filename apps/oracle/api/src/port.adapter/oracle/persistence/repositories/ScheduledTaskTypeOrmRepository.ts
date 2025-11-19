// SPDX-License-Identifier: Apache-2.0
import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import type { ScheduledTaskResultRepository } from "@domain/oracle/repositories/ScheduledTaskResultRepository"
import { ScheduledTaskResult } from "@domain/oracle/model/ScheduledTaskResult"
import { ScheduledTaskResultPersistence } from "../model/ScheduledTaskResultPersistence"
import { TaskStatus } from "@domain/oracle/model/TaskStatus"
import { plainToInstance } from "class-transformer"
import { Page, PageOptions } from "@hashgraph/green-bonds-shared-core"

@Injectable()
export class ScheduledTaskTypeOrmRepository implements ScheduledTaskResultRepository {
  constructor(
    @InjectRepository(ScheduledTaskResultPersistence)
    private readonly repository: Repository<ScheduledTaskResultPersistence>,
  ) {}

  async save(taskResult: ScheduledTaskResult): Promise<ScheduledTaskResult> {
    const entity = this.toEntity(taskResult)
    const saved = await this.repository.save(entity)
    return this.toDomain(saved)!
  }

  async findById(id: string): Promise<ScheduledTaskResult | null> {
    const entity = await this.repository.findOne({ where: { id } })
    return this.toDomain(entity)
  }

  async findLatestByProject(registryId: string, projectId: string): Promise<ScheduledTaskResult | null> {
    const entity = await this.repository.findOne({
      where: { oracleRegistryId: registryId, projectId },
      order: { scheduledTime: "DESC" },
    })
    return this.toDomain(entity)
  }

  async findByRegistryId(
    registryId: string,
    pageOptions: PageOptions,
    projectId?: string,
    status?: TaskStatus,
  ): Promise<Page<ScheduledTaskResult>> {
    const query = this.repository
      .createQueryBuilder("task")
      .where("task.oracleRegistryId = :registryId", { registryId })

    if (projectId) {
      query.andWhere("task.projectId = :projectId", { projectId })
    }

    if (status) {
      query.andWhere("task.status = :status", { status })
    }

    query.orderBy("task.scheduledTime", "DESC")

    const [entities, total] = await query
      .skip((pageOptions.page - 1) * pageOptions.limit)
      .take(pageOptions.limit)
      .getManyAndCount()

    const items = entities.map((entity) => this.toDomain(entity)!)

    return {
      items,
      total,
      page: pageOptions.page,
      limit: pageOptions.limit,
      totalPages: Math.ceil(total / pageOptions.limit),
    }
  }

  private toDomain(persistence: ScheduledTaskResultPersistence | null): ScheduledTaskResult | null {
    return persistence ? plainToInstance(ScheduledTaskResult, persistence) : null
  }

  private toEntity(domain: ScheduledTaskResult): ScheduledTaskResultPersistence {
    const entity = new ScheduledTaskResultPersistence()
    entity.id = domain.id
    entity.oracleRegistryId = domain.oracleRegistryId
    entity.projectId = domain.projectId
    entity.scheduledTime = domain.scheduledTime
    entity.executionTime = domain.executionTime
    entity.completedAt = domain.completedAt
    entity.status = domain.status
    entity.retryCount = domain.retryCount
    entity.errorType = domain.errorType
    entity.errorMessage = domain.errorMessage
    entity.kpiValue = domain.kpiValue
    entity.transactionHash = domain.transactionHash
    entity.createdAt = domain.createdAt
    entity.updatedAt = domain.updatedAt
    return entity
  }
}
