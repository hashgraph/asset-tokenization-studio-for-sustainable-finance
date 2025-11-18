// SPDX-License-Identifier: Apache-2.0
import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import type { ScheduledTaskRepository } from "@domain/oracle/repositories/ScheduledTaskRepository"
import { ScheduledTaskResult } from "@domain/oracle/model/ScheduledTaskResult"
import { ScheduledTaskResultPersistence } from "../model/ScheduledTaskResultPersistence"
import { ScheduledTaskResultMapper } from "../ScheduledTaskResultMapper"
import { TaskStatus } from "@domain/oracle/model/TaskStatus"

@Injectable()
export class ScheduledTaskTypeOrmRepository implements ScheduledTaskRepository {
  constructor(
    @InjectRepository(ScheduledTaskResultPersistence)
    private readonly repository: Repository<ScheduledTaskResultPersistence>,
  ) {}

  async save(taskResult: ScheduledTaskResult): Promise<ScheduledTaskResult> {
    const entity = ScheduledTaskResultMapper.toEntity(taskResult)
    const saved = await this.repository.save(entity)
    return ScheduledTaskResultMapper.toDomain(saved)
  }

  async findById(id: string): Promise<ScheduledTaskResult | null> {
    const entity = await this.repository.findOne({ where: { id } })
    return entity ? ScheduledTaskResultMapper.toDomain(entity) : null
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
    return entities.map((entity) => ScheduledTaskResultMapper.toDomain(entity))
  }

  async findLatestByProject(oracleRegistryId: string, projectId: string): Promise<ScheduledTaskResult | null> {
    const entity = await this.repository.findOne({
      where: { oracleRegistryId, projectId },
      order: { scheduledTime: "DESC" },
    })
    return entity ? ScheduledTaskResultMapper.toDomain(entity) : null
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
}
