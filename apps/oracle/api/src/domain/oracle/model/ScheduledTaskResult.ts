// SPDX-License-Identifier: Apache-2.0
import { TaskStatus } from "./TaskStatus"

/**
 * ScheduledTaskResult Entity
 * Represents the result of a scheduled KPI execution for a project
 */
export class ScheduledTaskResult {
  constructor(
    public readonly id: string,
    public readonly oracleRegistryId: string,
    public readonly projectId: string,
    public readonly scheduledTime: Date,
    public readonly executionTime: Date,
    public readonly completedAt: Date | null,
    public readonly status: TaskStatus,
    public readonly retryCount: number,
    public readonly errorType: string | null,
    public readonly errorMessage: string | null,
    public readonly kpiValue: number | null,
    public readonly transactionHash: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static createPending(
    id: string,
    oracleRegistryId: string,
    projectId: string,
    scheduledTime: Date,
  ): ScheduledTaskResult {
    return new ScheduledTaskResult(
      id,
      oracleRegistryId,
      projectId,
      scheduledTime,
      new Date(),
      null,
      TaskStatus.RUNNING,
      0,
      null,
      null,
      null,
      null,
      new Date(),
      new Date(),
    )
  }

  markAsSuccess(kpiValue: number, transactionHash: string): ScheduledTaskResult {
    return new ScheduledTaskResult(
      this.id,
      this.oracleRegistryId,
      this.projectId,
      this.scheduledTime,
      this.executionTime,
      new Date(),
      TaskStatus.SUCCESS,
      this.retryCount,
      null,
      null,
      kpiValue,
      transactionHash,
      this.createdAt,
      new Date(),
    )
  }

  markAsFailed(errorType: string, errorMessage: string): ScheduledTaskResult {
    return new ScheduledTaskResult(
      this.id,
      this.oracleRegistryId,
      this.projectId,
      this.scheduledTime,
      this.executionTime,
      new Date(),
      TaskStatus.FAILED,
      this.retryCount,
      errorType,
      errorMessage,
      null,
      null,
      this.createdAt,
      new Date(),
    )
  }

  incrementRetry(): ScheduledTaskResult {
    return new ScheduledTaskResult(
      this.id,
      this.oracleRegistryId,
      this.projectId,
      this.scheduledTime,
      new Date(), // New execution time
      null,
      TaskStatus.RUNNING,
      this.retryCount + 1,
      null,
      null,
      null,
      null,
      this.createdAt,
      new Date(),
    )
  }

  canRetry(maxRetries: number): boolean {
    return this.status === TaskStatus.FAILED && this.retryCount < maxRetries
  }
}
