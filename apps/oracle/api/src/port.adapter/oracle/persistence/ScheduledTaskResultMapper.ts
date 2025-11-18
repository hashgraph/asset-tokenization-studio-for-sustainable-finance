// SPDX-License-Identifier: Apache-2.0
import { ScheduledTaskResult } from "@domain/oracle/model/ScheduledTaskResult"
import { ScheduledTaskResultPersistence } from "./model/ScheduledTaskResultPersistence"

export class ScheduledTaskResultMapper {
  static toDomain(entity: ScheduledTaskResultPersistence): ScheduledTaskResult {
    return new ScheduledTaskResult(
      entity.id,
      entity.oracleRegistryId,
      entity.projectId,
      entity.scheduledTime,
      entity.executionTime,
      entity.completedAt,
      entity.status,
      entity.retryCount,
      entity.errorType,
      entity.errorMessage,
      entity.kpiValue,
      entity.transactionHash,
      entity.createdAt,
      entity.updatedAt,
    )
  }

  static toEntity(domain: ScheduledTaskResult): ScheduledTaskResultPersistence {
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
