// SPDX-License-Identifier: Apache-2.0
import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import type { ScheduledTaskRepository } from "@domain/oracle/repositories/ScheduledTaskRepository"
import { ScheduledTaskResult } from "@domain/oracle/model/ScheduledTaskResult"
import { ScheduledTaskResultPersistence } from "../model/ScheduledTaskResultPersistence"
import { TaskStatus } from "@domain/oracle/model/TaskStatus"
import { plainToInstance } from "class-transformer"

@Injectable()
export class ScheduledTaskTypeOrmRepository implements ScheduledTaskRepository {
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

  async findByOracleRegistryId(
    oracleRegistryId: string,
    options?: {
      projectId?: string
      status?: TaskStatus
      page?: number
      limit?: number
    },
  ): Promise<ScheduledTaskResult[]> {
    const query = this.repository
      .createQueryBuilder("task")
      .where("task.oracleRegistryId = :oracleRegistryId", { oracleRegistryId })

    if (options?.projectId) {
      query.andWhere("task.projectId = :projectId", {
        projectId: options.projectId,
      })
    }

    if (options?.status) {
      query.andWhere("task.status = :status", { status: options.status })
    }

    if (options?.page && options?.limit) {
      query.skip((options.page - 1) * options.limit).take(options.limit)
    }

    query.orderBy("task.scheduledTime", "DESC")

    const entities = await query.getMany()
    return entities.map((entity) => this.toDomain(entity)!)
  }

  async findLatestByProject(oracleRegistryId: string, projectId: string): Promise<ScheduledTaskResult | null> {
    const entity = await this.repository.findOne({
      where: { oracleRegistryId, projectId },
      order: { scheduledTime: "DESC" },
    })
    return this.toDomain(entity)
  }

  async countByOracleRegistryId(
    oracleRegistryId: string,
    options?: {
      projectId?: string
      status?: TaskStatus
    },
  ): Promise<number> {
    const query = this.repository
      .createQueryBuilder("task")
      .where("task.oracleRegistryId = :oracleRegistryId", { oracleRegistryId })

    if (options?.projectId) {
      query.andWhere("task.projectId = :projectId", {
        projectId: options.projectId,
      })
    }

    if (options?.status) {
      query.andWhere("task.status = :status", { status: options.status })
    }

    return await query.getCount()
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
