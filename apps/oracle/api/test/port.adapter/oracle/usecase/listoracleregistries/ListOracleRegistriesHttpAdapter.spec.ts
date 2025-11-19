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
import { OracleStatus } from "@domain/oracle/model/OracleStatus"

describe("ListOracleRegistriesHttpAdapter API Integration", () => {
  let app: INestApplication
  let container: PostgreSqlContainer
  let oracleRegistryRepository: Repository<OracleRegistryPersistence>

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
  })

  afterAll(async () => {
    await container.stop()
  })

  afterEach(async () => {
    if (app) {
      // Clean up database before closing app
      const registries = await oracleRegistryRepository.find()
      if (registries.length > 0) {
        await oracleRegistryRepository.remove(registries)
      }
      await app.close()
    }
  })

  describe("GET /", () => {
    it("should return empty page when no oracle registries exist", async () => {
      const response = await request(app.getHttpServer())
        .get("/api/v1/oracle/registries")
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

    it("should return paginated oracle registries with correct structure", async () => {
      const timestamp = Date.now() + Math.floor(Math.random() * 100000)
      const startDate = new Date("2025-01-01T00:00:00Z")
      const endDate = new Date("2030-01-01T00:00:00Z")
      const nextExecutionDate = new Date("2025-01-02T00:00:00Z")

      const registry = await oracleRegistryRepository.save({
        bondContractId: `0.0.${timestamp}`,
        kpiContractId: `0.0.${timestamp}`,
        projects: [
          { projectId: "project-1", topicId: `0.0.${timestamp}` },
          { projectId: "project-2", topicId: `0.0.${timestamp}` },
        ],
        schedulerStartDate: startDate,
        schedulerEndDate: endDate,
        nextExecutionDate: nextExecutionDate,
        frequencyMinutes: 60,
        status: OracleStatus.ACTIVE,
      })

      const response = await request(app.getHttpServer())
        .get("/api/v1/oracle/registries")
        .query({ page: 1, limit: 10 })
        .expect(HttpStatus.OK)

      expect(response.body.items).toHaveLength(1)
      expect(response.body.total).toBe(1)
      expect(response.body.page).toBe(1)
      expect(response.body.limit).toBe(10)
      expect(response.body.totalPages).toBe(1)

      const registryResponse = response.body.items[0]
      expect(registryResponse).toMatchObject({
        id: registry.id,
        bondContractId: registry.bondContractId,
        kpiContractId: registry.kpiContractId,
        projects: [
          { projectId: "project-1", topicId: `0.0.${timestamp}` },
          { projectId: "project-2", topicId: `0.0.${timestamp}` },
        ],
        config: {
          schedulerStartDate: startDate.toISOString(),
          schedulerEndDate: endDate.toISOString(),
          frequencyMinutes: 60,
        },
        status: OracleStatus.ACTIVE,
      })
    })

    it("should handle pagination correctly", async () => {
      const startDate = new Date("2025-01-01T00:00:00Z")
      const endDate = new Date("2030-01-01T00:00:00Z")
      const nextExecutionDate = new Date("2025-01-02T00:00:00Z")

      for (let i = 1; i <= 3; i++) {
        await oracleRegistryRepository.save({
          bondContractId: `0.0.${6824000 + i}`,
          kpiContractId: `0.0.${6824100 + i}`,
          projects: [{ projectId: `project-${i}`, topicId: `0.0.${6824200 + i}` }],
          schedulerStartDate: startDate,
          schedulerEndDate: endDate,
          nextExecutionDate: nextExecutionDate,
          frequencyMinutes: 60,
          status: OracleStatus.ACTIVE,
        })
      }

      const response = await request(app.getHttpServer())
        .get("/api/v1/oracle/registries")
        .query({ page: 2, limit: 2 })
        .expect(HttpStatus.OK)

      expect(response.body.page).toBe(2)
      expect(response.body.limit).toBe(2)
      expect(response.body.total).toBe(3)
      expect(response.body.totalPages).toBe(2)
      expect(response.body.items).toHaveLength(1)
    })

    it("should return registries with different statuses", async () => {
      const timestamp = Date.now() + Math.floor(Math.random() * 100000)
      const startDate = new Date("2025-01-01T00:00:00Z")
      const nextExecutionDate = new Date("2025-01-02T00:00:00Z")

      await oracleRegistryRepository.save({
        bondContractId: `0.0.${timestamp}`,
        kpiContractId: `0.0.${timestamp}`,
        projects: [{ projectId: "project-1", topicId: `0.0.${timestamp}` }],
        schedulerStartDate: startDate,
        schedulerEndDate: null,
        nextExecutionDate: nextExecutionDate,
        frequencyMinutes: 60,
        status: OracleStatus.ACTIVE,
      })

      await oracleRegistryRepository.save({
        bondContractId: `0.0.${timestamp + 1}`,
        kpiContractId: `0.0.${timestamp + 2}`,
        projects: [{ projectId: "project-2", topicId: `0.0.${timestamp + 3}` }],
        schedulerStartDate: startDate,
        schedulerEndDate: null,
        nextExecutionDate: nextExecutionDate,
        frequencyMinutes: 30,
        status: OracleStatus.PAUSED,
      })

      const response = await request(app.getHttpServer())
        .get("/api/v1/oracle/registries")
        .query({ page: 1, limit: 10 })
        .expect(HttpStatus.OK)

      expect(response.body.items).toHaveLength(2)
      const statuses = response.body.items.map((item: any) => item.status).sort()
      expect(statuses).toEqual([OracleStatus.ACTIVE, OracleStatus.PAUSED])
    })

    it("should validate pagination parameters", async () => {
      await request(app.getHttpServer())
        .get("/api/v1/oracle/registries")
        .query({ page: -1 })
        .expect(HttpStatus.BAD_REQUEST)

      await request(app.getHttpServer())
        .get("/api/v1/oracle/registries")
        .query({ limit: 0 })
        .expect(HttpStatus.BAD_REQUEST)

      await request(app.getHttpServer())
        .get("/api/v1/oracle/registries")
        .query({ order: "INVALID" })
        .expect(HttpStatus.BAD_REQUEST)
    })
  })
})
