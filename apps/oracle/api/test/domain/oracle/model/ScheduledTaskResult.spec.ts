// SPDX-License-Identifier: Apache-2.0

import { ScheduledTaskResult } from "@domain/oracle/model/ScheduledTaskResult"
import { TaskStatus } from "@domain/oracle/model/TaskStatus"

describe("ScheduledTaskResult", () => {
  const createBaseTask = (status: TaskStatus, retryCount: number = 0): ScheduledTaskResult => {
    return new ScheduledTaskResult(
      "task-1",
      "registry-1",
      "project-1",
      new Date("2025-01-01T11:00:00Z"), // fromDate
      new Date("2025-01-01T12:00:00Z"), // toDate
      new Date("2025-01-01T12:00:05Z"), // executionTime
      new Date("2025-01-01T12:00:10Z"), // completedAt
      status,
      retryCount,
      status === TaskStatus.FAILED ? "NetworkError" : null,
      status === TaskStatus.FAILED ? "Connection timeout" : null,
      status === TaskStatus.SUCCESS ? 42.5 : null,
      status === TaskStatus.SUCCESS ? "0x1234567890abcdef" : null,
      new Date(),
      new Date(),
    )
  }

  describe("createPending", () => {
    it("should create a pending task with RUNNING status", () => {
      const fromDate = new Date("2025-01-01T11:00:00Z")
      const toDate = new Date("2025-01-01T12:00:00Z")

      const task = ScheduledTaskResult.createPending("task-1", "registry-1", "project-1", fromDate, toDate)

      expect(task.id).toBe("task-1")
      expect(task.oracleRegistryId).toBe("registry-1")
      expect(task.projectId).toBe("project-1")
      expect(task.fromDate).toEqual(fromDate)
      expect(task.toDate).toEqual(toDate)
      expect(task.status).toBe(TaskStatus.RUNNING)
      expect(task.retryCount).toBe(0)
      expect(task.completedAt).toBeNull()
      expect(task.kpiValue).toBeNull()
      expect(task.transactionHash).toBeNull()
      expect(task.errorType).toBeNull()
      expect(task.errorMessage).toBeNull()
    })

    it("should allow null fromDate for first execution", () => {
      const toDate = new Date("2025-01-01T12:00:00Z")

      const task = ScheduledTaskResult.createPending("task-1", "registry-1", "project-1", null, toDate)

      expect(task.fromDate).toBeNull()
      expect(task.toDate).toEqual(toDate)
    })
  })

  describe("markAsSuccess", () => {
    it("should mark task as SUCCESS with kpiValue and transactionHash", () => {
      const pendingTask = ScheduledTaskResult.createPending(
        "task-1",
        "registry-1",
        "project-1",
        new Date("2025-01-01T11:00:00Z"),
        new Date("2025-01-01T12:00:00Z"),
      )

      const successTask = pendingTask.markAsSuccess(42.5, "0xabc123")

      expect(successTask.status).toBe(TaskStatus.SUCCESS)
      expect(successTask.kpiValue).toBe(42.5)
      expect(successTask.transactionHash).toBe("0xabc123")
      expect(successTask.completedAt).toBeInstanceOf(Date)
      expect(successTask.errorType).toBeNull()
      expect(successTask.errorMessage).toBeNull()
      // Should preserve original values
      expect(successTask.id).toBe(pendingTask.id)
      expect(successTask.fromDate).toEqual(pendingTask.fromDate)
      expect(successTask.toDate).toEqual(pendingTask.toDate)
      expect(successTask.retryCount).toBe(pendingTask.retryCount)
    })
  })

  describe("markAsFailed", () => {
    it("should mark task as FAILED with error details", () => {
      const pendingTask = ScheduledTaskResult.createPending(
        "task-1",
        "registry-1",
        "project-1",
        new Date("2025-01-01T11:00:00Z"),
        new Date("2025-01-01T12:00:00Z"),
      )

      const failedTask = pendingTask.markAsFailed("NetworkError", "Connection timeout")

      expect(failedTask.status).toBe(TaskStatus.FAILED)
      expect(failedTask.errorType).toBe("NetworkError")
      expect(failedTask.errorMessage).toBe("Connection timeout")
      expect(failedTask.completedAt).toBeInstanceOf(Date)
      expect(failedTask.kpiValue).toBeNull()
      expect(failedTask.transactionHash).toBeNull()
      // Should preserve original values
      expect(failedTask.id).toBe(pendingTask.id)
      expect(failedTask.fromDate).toEqual(pendingTask.fromDate)
      expect(failedTask.toDate).toEqual(pendingTask.toDate)
      expect(failedTask.retryCount).toBe(pendingTask.retryCount)
    })
  })

  describe("incrementRetry", () => {
    it("should increment retry count and reset to RUNNING status", () => {
      const failedTask = createBaseTask(TaskStatus.FAILED, 1)

      const retryTask = failedTask.incrementRetry()

      expect(retryTask.retryCount).toBe(2)
      expect(retryTask.status).toBe(TaskStatus.RUNNING)
      expect(retryTask.completedAt).toBeNull()
      expect(retryTask.errorType).toBeNull()
      expect(retryTask.errorMessage).toBeNull()
      expect(retryTask.kpiValue).toBeNull()
      expect(retryTask.transactionHash).toBeNull()
      // Should preserve date range
      expect(retryTask.fromDate).toEqual(failedTask.fromDate)
      expect(retryTask.toDate).toEqual(failedTask.toDate)
    })

    it("should update executionTime when incrementing retry", () => {
      const failedTask = createBaseTask(TaskStatus.FAILED, 0)
      const originalExecutionTime = failedTask.executionTime

      // Small delay to ensure different timestamps
      const retryTask = failedTask.incrementRetry()

      expect(retryTask.executionTime.getTime()).toBeGreaterThanOrEqual(originalExecutionTime.getTime())
    })
  })

  describe("canRetry", () => {
    it("should return true for FAILED task with retryCount < maxRetries", () => {
      const failedTask = createBaseTask(TaskStatus.FAILED, 0)

      expect(failedTask.canRetry(3)).toBe(true)
    })

    it("should return true for FAILED task with retryCount = maxRetries - 1", () => {
      const failedTask = createBaseTask(TaskStatus.FAILED, 2)

      expect(failedTask.canRetry(3)).toBe(true)
    })

    it("should return false for FAILED task with retryCount >= maxRetries", () => {
      const failedTask = createBaseTask(TaskStatus.FAILED, 3)

      expect(failedTask.canRetry(3)).toBe(false)
    })

    it("should return false for SUCCESS task regardless of retryCount", () => {
      const successTask = createBaseTask(TaskStatus.SUCCESS, 0)

      expect(successTask.canRetry(3)).toBe(false)
    })

    it("should return false for RUNNING task regardless of retryCount", () => {
      const runningTask = ScheduledTaskResult.createPending(
        "task-1",
        "registry-1",
        "project-1",
        new Date("2025-01-01T11:00:00Z"),
        new Date("2025-01-01T12:00:00Z"),
      )

      expect(runningTask.canRetry(3)).toBe(false)
    })

    it("should handle maxRetries of 0 (no retries allowed)", () => {
      const failedTask = createBaseTask(TaskStatus.FAILED, 0)

      expect(failedTask.canRetry(0)).toBe(false)
    })

    it("should handle high maxRetries value", () => {
      const failedTask = createBaseTask(TaskStatus.FAILED, 9)

      expect(failedTask.canRetry(10)).toBe(true)
      expect(failedTask.canRetry(9)).toBe(false)
    })
  })

  describe("date range preservation", () => {
    it("should preserve fromDate and toDate through state transitions", () => {
      const fromDate = new Date("2025-01-01T11:00:00Z")
      const toDate = new Date("2025-01-01T12:00:00Z")

      // Create -> Fail -> Retry -> Fail -> Success
      let task = ScheduledTaskResult.createPending("task-1", "registry-1", "project-1", fromDate, toDate)
      expect(task.fromDate).toEqual(fromDate)
      expect(task.toDate).toEqual(toDate)

      task = task.markAsFailed("Error", "First failure")
      expect(task.fromDate).toEqual(fromDate)
      expect(task.toDate).toEqual(toDate)

      task = task.incrementRetry()
      expect(task.fromDate).toEqual(fromDate)
      expect(task.toDate).toEqual(toDate)

      task = task.markAsFailed("Error", "Second failure")
      expect(task.fromDate).toEqual(fromDate)
      expect(task.toDate).toEqual(toDate)

      task = task.incrementRetry()
      expect(task.fromDate).toEqual(fromDate)
      expect(task.toDate).toEqual(toDate)

      task = task.markAsSuccess(42.5, "0xabc123")
      expect(task.fromDate).toEqual(fromDate)
      expect(task.toDate).toEqual(toDate)
    })
  })
})
