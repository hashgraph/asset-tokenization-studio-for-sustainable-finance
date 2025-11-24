// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { HttpStatus, INestApplication } from "@nestjs/common"
import request from "supertest"
import { ScheduleModule } from "@nestjs/schedule"
import { CONTROLLERS, PROVIDERS } from "../../../../../src/Components"
import { SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "../../../../shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"
import { Repository } from "typeorm"
import { getRepositoryToken } from "@nestjs/typeorm"
import { OracleRegistryPersistence } from "@port/oracle/persistence/model/OracleRegistryPersistence"
import { ScheduledTaskResultPersistence } from "@port/oracle/persistence/model/ScheduledTaskResultPersistence"
import { OracleStatus } from "@domain/oracle/model/OracleStatus"
import { TaskStatus } from "@domain/oracle/model/TaskStatus"

describe("GetExecutionHistoryHttpAdapter API Integration", () => {
  let app: INestApplication
  let container: PostgreSqlContainer
  let oracleRegistryRepository: Repository<OracleRegistryPersistence>
  let taskResultRepository: Repository<ScheduledTaskResultPersistence>

  beforeAll(async () => {
    container = await PostgreSqlContainer.create()
  })

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SharedModule, ScheduleModule.forRoot(), PostgresModule.forRoot(container.getConfig())],
      controllers: CONTROLLERS,
      providers: [...PROVIDERS],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.setGlobalPrefix("api/v1")
    app.useLogger(false)
    await app.init()
    oracleRegistryRepository = app.get(getRepositoryToken(OracleRegistryPersistence))
    taskResultRepository = app.get(getRepositoryToken(ScheduledTaskResultPersistence))
  })

  afterAll(async () => {
    await container.stop()
  })

  afterEach(async () => {
    if (app) {
      await app.close()
    }
  })

  describe("GET /:registryId/executions", () => {
    it("should return empty page when no executions exist", async () => {
      const timestamp = Date.now() + Math.floor(Math.random() * 100000)
      const startDate = new Date("2025-01-01T00:00:00Z")
      const nextExecutionDate = new Date("2025-01-02T00:00:00Z")

      const registry = await oracleRegistryRepository.save({
        bondContractId: `0.0.${timestamp}`,
        kpiContractId: `0.0.${timestamp + 1}`,
        projects: [{ projectId: "project-1", topicId: `0.0.${timestamp + 2}` }],
        schedulerStartDate: startDate,
        schedulerEndDate: null,
        nextExecutionDate: nextExecutionDate,
        frequencyMinutes: 60,
        status: OracleStatus.ACTIVE,
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/oracle/registries/${registry.id}/executions`)
        .query({ page: 1, limit: 10 })
        .expect(HttpStatus.OK)

      expect(response.body).toEqual({
        items: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      })
    })

    it("should return paginated execution history", async () => {
      const timestamp = Date.now() + Math.floor(Math.random() * 100000)
      const startDate = new Date("2025-01-01T00:00:00Z")
      const nextExecutionDate = new Date("2025-01-02T00:00:00Z")

      const registry = await oracleRegistryRepository.save({
        bondContractId: `0.0.${timestamp}`,
        kpiContractId: `0.0.${timestamp + 1}`,
        projects: [{ projectId: "project-1", topicId: `0.0.${timestamp + 2}` }],
        schedulerStartDate: startDate,
        schedulerEndDate: null,
        nextExecutionDate: nextExecutionDate,
        frequencyMinutes: 60,
        status: OracleStatus.ACTIVE,
      })

      const fromDate = new Date("2025-01-01T11:00:00Z")
      const toDate = new Date("2025-01-01T12:00:00Z")
      const executionTime = new Date("2025-01-01T12:00:05Z")
      const completedAt = new Date("2025-01-01T12:00:10Z")

      await taskResultRepository.save({
        oracleRegistryId: registry.id,
        projectId: "project-1",
        fromDate,
        toDate,
        executionTime,
        completedAt,
        status: TaskStatus.SUCCESS,
        retryCount: 0,
        kpiValue: 42.5,
        transactionHash: "0x1234567890abcdef",
        errorType: null,
        errorMessage: null,
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/oracle/registries/${registry.id}/executions`)
        .query({ page: 1, limit: 10 })
        .expect(HttpStatus.OK)

      expect(response.body.items).toHaveLength(1)
      expect(response.body.total).toBe(1)
      expect(response.body.items[0]).toMatchObject({
        oracleRegistryId: registry.id,
        projectId: "project-1",
        status: TaskStatus.SUCCESS,
        kpiValue: 42.5,
        transactionHash: "0x1234567890abcdef",
        retryCount: 0,
      })
    })

    it("should filter execution history by projectId", async () => {
      const timestamp = Date.now() + Math.floor(Math.random() * 100000)
      const startDate = new Date("2025-01-01T00:00:00Z")
      const nextExecutionDate = new Date("2025-01-02T00:00:00Z")

      const registry = await oracleRegistryRepository.save({
        bondContractId: `0.0.${timestamp}`,
        kpiContractId: `0.0.${timestamp + 1}`,
        projects: [
          { projectId: "project-1", topicId: `0.0.${timestamp + 2}` },
          { projectId: "project-2", topicId: `0.0.${timestamp + 3}` },
        ],
        schedulerStartDate: startDate,
        schedulerEndDate: null,
        nextExecutionDate: nextExecutionDate,
        frequencyMinutes: 60,
        status: OracleStatus.ACTIVE,
      })

      const fromDate = new Date("2025-01-01T11:00:00Z")
      const toDate = new Date("2025-01-01T12:00:00Z")
      const executionTime = new Date("2025-01-01T12:00:05Z")

      await taskResultRepository.save({
        oracleRegistryId: registry.id,
        projectId: "project-1",
        fromDate,
        toDate,
        executionTime,
        completedAt: new Date("2025-01-01T12:00:10Z"),
        status: TaskStatus.SUCCESS,
        retryCount: 0,
        kpiValue: 42.5,
        transactionHash: "0x1234567890abcdef",
        errorType: null,
        errorMessage: null,
      })

      await taskResultRepository.save({
        oracleRegistryId: registry.id,
        projectId: "project-2",
        fromDate,
        toDate,
        executionTime,
        completedAt: new Date("2025-01-01T12:00:15Z"),
        status: TaskStatus.SUCCESS,
        retryCount: 0,
        kpiValue: 100.0,
        transactionHash: "0xabcdef1234567890",
        errorType: null,
        errorMessage: null,
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/oracle/registries/${registry.id}/executions`)
        .query({ page: 1, limit: 10, projectId: "project-1" })
        .expect(HttpStatus.OK)

      expect(response.body.items).toHaveLength(1)
      expect(response.body.items[0].projectId).toBe("project-1")
    })

    it("should filter execution history by status", async () => {
      const timestamp = Date.now() + Math.floor(Math.random() * 100000)
      const startDate = new Date("2025-01-01T00:00:00Z")
      const nextExecutionDate = new Date("2025-01-02T00:00:00Z")

      const registry = await oracleRegistryRepository.save({
        bondContractId: `0.0.${timestamp}`,
        kpiContractId: `0.0.${timestamp + 1}`,
        projects: [{ projectId: "project-1", topicId: `0.0.${timestamp + 2}` }],
        schedulerStartDate: startDate,
        schedulerEndDate: null,
        nextExecutionDate: nextExecutionDate,
        frequencyMinutes: 60,
        status: OracleStatus.ACTIVE,
      })

      const fromDate = new Date("2025-01-01T11:00:00Z")
      const toDate = new Date("2025-01-01T12:00:00Z")
      const executionTime = new Date("2025-01-01T12:00:05Z")

      await taskResultRepository.save({
        oracleRegistryId: registry.id,
        projectId: "project-1",
        fromDate,
        toDate,
        executionTime,
        completedAt: new Date("2025-01-01T12:00:10Z"),
        status: TaskStatus.SUCCESS,
        retryCount: 0,
        kpiValue: 42.5,
        transactionHash: "0x1234567890abcdef",
        errorType: null,
        errorMessage: null,
      })

      await taskResultRepository.save({
        oracleRegistryId: registry.id,
        projectId: "project-1",
        fromDate: new Date("2025-01-01T12:00:00Z"),
        toDate: new Date("2025-01-01T13:00:00Z"),
        executionTime: new Date("2025-01-01T13:00:05Z"),
        completedAt: new Date("2025-01-01T13:00:10Z"),
        status: TaskStatus.FAILED,
        retryCount: 1,
        kpiValue: null,
        transactionHash: null,
        errorType: "NetworkError",
        errorMessage: "Connection timeout",
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/oracle/registries/${registry.id}/executions`)
        .query({ page: 1, limit: 10, status: TaskStatus.FAILED })
        .expect(HttpStatus.OK)

      expect(response.body.items).toHaveLength(1)
      expect(response.body.items[0].status).toBe(TaskStatus.FAILED)
      expect(response.body.items[0].errorType).toBe("NetworkError")
    })

    it("should handle pagination correctly", async () => {
      const timestamp = Date.now() + Math.floor(Math.random() * 100000)
      const startDate = new Date("2025-01-01T00:00:00Z")
      const nextExecutionDate = new Date("2025-01-02T00:00:00Z")

      const registry = await oracleRegistryRepository.save({
        bondContractId: `0.0.${timestamp}`,
        kpiContractId: `0.0.${timestamp + 1}`,
        projects: [{ projectId: "project-1", topicId: `0.0.${timestamp + 2}` }],
        schedulerStartDate: startDate,
        schedulerEndDate: null,
        nextExecutionDate: nextExecutionDate,
        frequencyMinutes: 60,
        status: OracleStatus.ACTIVE,
      })

      for (let i = 0; i < 3; i++) {
        await taskResultRepository.save({
          oracleRegistryId: registry.id,
          projectId: "project-1",
          fromDate: new Date(`2025-01-01T${11 + i}:00:00Z`),
          toDate: new Date(`2025-01-01T${12 + i}:00:00Z`),
          executionTime: new Date(`2025-01-01T${12 + i}:00:05Z`),
          completedAt: new Date(`2025-01-01T${12 + i}:00:10Z`),
          status: TaskStatus.SUCCESS,
          retryCount: 0,
          kpiValue: 42.5 + i,
          transactionHash: `0x${i}234567890abcdef`,
          errorType: null,
          errorMessage: null,
        })
      }

      const response = await request(app.getHttpServer())
        .get(`/api/v1/oracle/registries/${registry.id}/executions`)
        .query({ page: 2, limit: 2 })
        .expect(HttpStatus.OK)

      expect(response.body.page).toBe(2)
      expect(response.body.limit).toBe(2)
      expect(response.body.total).toBe(3)
      expect(response.body.totalPages).toBe(2)
      expect(response.body.items).toHaveLength(1)
    })

    it("should return 404 when registry does not exist", async () => {
      const nonExistentId = "00000000-0000-0000-0000-000000000000"

      await request(app.getHttpServer())
        .get(`/api/v1/oracle/registries/${nonExistentId}/executions`)
        .query({ page: 1, limit: 10 })
        .expect(HttpStatus.NOT_FOUND)
    })
  })
})
