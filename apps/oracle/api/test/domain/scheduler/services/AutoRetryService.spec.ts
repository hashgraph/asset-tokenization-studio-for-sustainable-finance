// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { AutoRetryService } from "@domain/scheduler/services/AutoRetryService"
import { OracleExecutionService } from "@domain/oracle/services/OracleExecutionService"
import { ScheduledTaskResult } from "@domain/oracle/model/ScheduledTaskResult"
import { SchedulerConfig } from "@domain/scheduler/model/SchedulerConfig"
import { OracleRegistry } from "@domain/oracle/model/OracleRegistry"
import { Project } from "@domain/oracle/model/Project"
import { TaskStatus } from "@domain/oracle/model/TaskStatus"
import { OracleStatus } from "@domain/oracle/model/OracleStatus"
import { OracleConfig } from "@domain/oracle/model/OracleConfig"

describe("AutoRetryService", () => {
  let service: AutoRetryService
  let mockTaskRepository: any
  let mockRegistryRepository: any
  let mockConfigRepository: any
  let mockExecutionService: any

  const createMockSchedulerConfig = (enabled: boolean = true): SchedulerConfig => {
    return new SchedulerConfig("config-1", "0 */5 * * * *", 10, enabled, new Date(), new Date())
  }

  const createMockOracleRegistry = (id: string = "registry-1"): OracleRegistry => {
    const config = new OracleConfig(new Date("2025-01-01T00:00:00Z"), null, new Date("2025-01-02T00:00:00Z"), 60)
    return new OracleRegistry(
      id,
      "0.0.123",
      "0.0.456",
      [new Project("project-1", "0.0.789")],
      config,
      OracleStatus.ACTIVE,
      new Date(),
      new Date(),
    )
  }

  const createMockFailedTask = (
    id: string,
    registryId: string,
    projectId: string,
    retryCount: number = 0,
  ): ScheduledTaskResult => {
    return new ScheduledTaskResult(
      id,
      registryId,
      projectId,
      new Date("2025-01-01T11:00:00Z"), // fromDate
      new Date("2025-01-01T12:00:00Z"), // toDate
      new Date("2025-01-01T12:00:05Z"), // executionTime
      new Date("2025-01-01T12:00:10Z"), // completedAt
      TaskStatus.FAILED,
      retryCount,
      "NetworkError",
      "Connection timeout",
      null,
      null,
      new Date(),
      new Date(),
    )
  }

  const createMockSuccessTask = (id: string, registryId: string, projectId: string): ScheduledTaskResult => {
    return new ScheduledTaskResult(
      id,
      registryId,
      projectId,
      new Date("2025-01-01T11:00:00Z"),
      new Date("2025-01-01T12:00:00Z"),
      new Date("2025-01-01T12:00:05Z"),
      new Date("2025-01-01T12:00:10Z"),
      TaskStatus.SUCCESS,
      0,
      null,
      null,
      42.5,
      "0x1234567890abcdef",
      new Date(),
      new Date(),
    )
  }

  beforeEach(async () => {
    // Reset env
    delete process.env.RETRY_MAX_ATTEMPTS

    mockTaskRepository = {
      findFailedTasksForRetry: jest.fn(),
      save: jest.fn(),
    }

    mockRegistryRepository = {
      findById: jest.fn(),
    }

    mockConfigRepository = {
      getOrCreateDefault: jest.fn(),
    }

    mockExecutionService = {
      retryTask: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AutoRetryService,
        { provide: "ScheduledTaskResultRepository", useValue: mockTaskRepository },
        { provide: "OracleRegistryRepository", useValue: mockRegistryRepository },
        { provide: "SchedulerConfigRepository", useValue: mockConfigRepository },
        { provide: OracleExecutionService, useValue: mockExecutionService },
      ],
    }).compile()

    service = module.get<AutoRetryService>(AutoRetryService)
  })

  describe("processFailedTasks", () => {
    it("should skip processing when scheduler is disabled", async () => {
      mockConfigRepository.getOrCreateDefault.mockResolvedValue(createMockSchedulerConfig(false))

      await service.processFailedTasks()

      expect(mockTaskRepository.findFailedTasksForRetry).not.toHaveBeenCalled()
      expect(mockExecutionService.retryTask).not.toHaveBeenCalled()
    })

    it("should do nothing when no failed tasks exist", async () => {
      mockConfigRepository.getOrCreateDefault.mockResolvedValue(createMockSchedulerConfig(true))
      mockTaskRepository.findFailedTasksForRetry.mockResolvedValue([])

      await service.processFailedTasks()

      expect(mockTaskRepository.findFailedTasksForRetry).toHaveBeenCalled()
      expect(mockExecutionService.retryTask).not.toHaveBeenCalled()
    })

    it("should retry failed tasks that have not exceeded max retries", async () => {
      const config = createMockSchedulerConfig(true)
      const registry = createMockOracleRegistry("registry-1")
      const failedTask = createMockFailedTask("task-1", "registry-1", "project-1", 0)
      const successResult = createMockSuccessTask("task-2", "registry-1", "project-1")

      mockConfigRepository.getOrCreateDefault.mockResolvedValue(config)
      mockTaskRepository.findFailedTasksForRetry.mockResolvedValue([failedTask])
      mockRegistryRepository.findById.mockResolvedValue(registry)
      mockExecutionService.retryTask.mockResolvedValue(successResult)

      await service.processFailedTasks()

      expect(mockExecutionService.retryTask).toHaveBeenCalledWith(failedTask, registry, 3)
    })

    it("should skip tasks that have exceeded max retries", async () => {
      const config = createMockSchedulerConfig(true)
      const failedTaskMaxRetries = createMockFailedTask("task-1", "registry-1", "project-1", 3)

      mockConfigRepository.getOrCreateDefault.mockResolvedValue(config)
      mockTaskRepository.findFailedTasksForRetry.mockResolvedValue([failedTaskMaxRetries])

      await service.processFailedTasks()

      expect(mockRegistryRepository.findById).not.toHaveBeenCalled()
      expect(mockExecutionService.retryTask).not.toHaveBeenCalled()
    })

    it("should skip task if registry is not found", async () => {
      const config = createMockSchedulerConfig(true)
      const failedTask = createMockFailedTask("task-1", "registry-1", "project-1", 0)

      mockConfigRepository.getOrCreateDefault.mockResolvedValue(config)
      mockTaskRepository.findFailedTasksForRetry.mockResolvedValue([failedTask])
      mockRegistryRepository.findById.mockResolvedValue(null)

      await service.processFailedTasks()

      expect(mockExecutionService.retryTask).not.toHaveBeenCalled()
    })

    it("should use RETRY_MAX_ATTEMPTS from environment variable", async () => {
      process.env.RETRY_MAX_ATTEMPTS = "5"

      const config = createMockSchedulerConfig(true)
      const registry = createMockOracleRegistry("registry-1")
      const failedTask = createMockFailedTask("task-1", "registry-1", "project-1", 4)
      const successResult = createMockSuccessTask("task-2", "registry-1", "project-1")

      mockConfigRepository.getOrCreateDefault.mockResolvedValue(config)
      mockTaskRepository.findFailedTasksForRetry.mockResolvedValue([failedTask])
      mockRegistryRepository.findById.mockResolvedValue(registry)
      mockExecutionService.retryTask.mockResolvedValue(successResult)

      await service.processFailedTasks()

      // With max 5, task with retryCount 4 can still retry
      expect(mockExecutionService.retryTask).toHaveBeenCalledWith(failedTask, registry, 5)
    })

    it("should default to 3 retries when RETRY_MAX_ATTEMPTS is invalid", async () => {
      process.env.RETRY_MAX_ATTEMPTS = "invalid"

      const config = createMockSchedulerConfig(true)
      const failedTask = createMockFailedTask("task-1", "registry-1", "project-1", 3)

      mockConfigRepository.getOrCreateDefault.mockResolvedValue(config)
      mockTaskRepository.findFailedTasksForRetry.mockResolvedValue([failedTask])

      await service.processFailedTasks()

      // With max 3, task with retryCount 3 cannot retry
      expect(mockExecutionService.retryTask).not.toHaveBeenCalled()
    })

    it("should continue processing other tasks if one retry fails", async () => {
      const config = createMockSchedulerConfig(true)
      const registry = createMockOracleRegistry("registry-1")
      const failedTask1 = createMockFailedTask("task-1", "registry-1", "project-1", 0)
      const failedTask2 = createMockFailedTask("task-2", "registry-1", "project-1", 1)
      const successResult = createMockSuccessTask("task-3", "registry-1", "project-1")

      mockConfigRepository.getOrCreateDefault.mockResolvedValue(config)
      mockTaskRepository.findFailedTasksForRetry.mockResolvedValue([failedTask1, failedTask2])
      mockRegistryRepository.findById.mockResolvedValue(registry)
      mockExecutionService.retryTask
        .mockRejectedValueOnce(new Error("Retry failed"))
        .mockResolvedValueOnce(successResult)

      await service.processFailedTasks()

      expect(mockExecutionService.retryTask).toHaveBeenCalledTimes(2)
    })

    it("should process multiple failed tasks", async () => {
      const config = createMockSchedulerConfig(true)
      const registry = createMockOracleRegistry("registry-1")
      const failedTask1 = createMockFailedTask("task-1", "registry-1", "project-1", 0)
      const failedTask2 = createMockFailedTask("task-2", "registry-1", "project-1", 1)
      const successResult = createMockSuccessTask("task-3", "registry-1", "project-1")

      mockConfigRepository.getOrCreateDefault.mockResolvedValue(config)
      mockTaskRepository.findFailedTasksForRetry.mockResolvedValue([failedTask1, failedTask2])
      mockRegistryRepository.findById.mockResolvedValue(registry)
      mockExecutionService.retryTask.mockResolvedValue(successResult)

      await service.processFailedTasks()

      expect(mockExecutionService.retryTask).toHaveBeenCalledTimes(2)
      expect(mockExecutionService.retryTask).toHaveBeenNthCalledWith(1, failedTask1, registry, 3)
      expect(mockExecutionService.retryTask).toHaveBeenNthCalledWith(2, failedTask2, registry, 3)
    })
  })
})
