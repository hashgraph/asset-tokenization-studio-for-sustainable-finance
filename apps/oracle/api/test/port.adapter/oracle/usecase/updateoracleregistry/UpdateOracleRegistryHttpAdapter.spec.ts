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

describe("UpdateOracleRegistryHttpAdapter API Integration", () => {
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
      await app.close()
    }
  })

  describe("PATCH /:id", () => {
    it("should update oracle registry schedulerStartDate", async () => {
      const timestamp = Date.now() + Math.floor(Math.random() * 100000)
      const startDate = new Date("2025-01-01T00:00:00Z")
      const endDate = new Date("2030-01-01T00:00:00Z")
      const nextExecutionDate = new Date("2025-01-02T00:00:00Z")

      const registry = await oracleRegistryRepository.save({
        bondContractId: `0.0.${timestamp}`,
        kpiContractId: `0.0.${timestamp + 1}`,
        projects: [{ projectId: "project-1", topicId: `0.0.${timestamp + 2}` }],
        schedulerStartDate: startDate,
        schedulerEndDate: endDate,
        nextExecutionDate: nextExecutionDate,
        frequencyMinutes: 60,
        status: OracleStatus.ACTIVE,
      })

      const newStartDate = "2025-02-01T00:00:00.000Z"
      const updateRequest = {
        schedulerStartDate: newStartDate,
      }

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/oracle/registries/${registry.id}`)
        .send(updateRequest)
        .expect(HttpStatus.OK)

      expect(response.body.config.schedulerStartDate).toBe(newStartDate)
      expect(response.body.config.frequencyMinutes).toBe(60)
    })

    it("should update oracle registry schedulerEndDate", async () => {
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

      const newEndDate = "2030-12-31T23:59:59.999Z"
      const updateRequest = {
        schedulerEndDate: newEndDate,
      }

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/oracle/registries/${registry.id}`)
        .send(updateRequest)
        .expect(HttpStatus.OK)

      expect(response.body.config.schedulerEndDate).toBe(newEndDate)
    })

    it("should update oracle registry schedulerEndDate to null", async () => {
      const timestamp = Date.now() + Math.floor(Math.random() * 100000)
      const startDate = new Date("2025-01-01T00:00:00Z")
      const endDate = new Date("2030-01-01T00:00:00Z")
      const nextExecutionDate = new Date("2025-01-02T00:00:00Z")

      const registry = await oracleRegistryRepository.save({
        bondContractId: `0.0.${timestamp}`,
        kpiContractId: `0.0.${timestamp + 1}`,
        projects: [{ projectId: "project-1", topicId: `0.0.${timestamp + 2}` }],
        schedulerStartDate: startDate,
        schedulerEndDate: endDate,
        nextExecutionDate: nextExecutionDate,
        frequencyMinutes: 60,
        status: OracleStatus.ACTIVE,
      })

      const updateRequest = {
        schedulerEndDate: null,
      }

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/oracle/registries/${registry.id}`)
        .send(updateRequest)
        .expect(HttpStatus.OK)

      expect(response.body.config.schedulerEndDate).toBeNull()
    })

    it("should update oracle registry frequencyMinutes", async () => {
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

      const updateRequest = {
        frequencyMinutes: 30,
      }

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/oracle/registries/${registry.id}`)
        .send(updateRequest)
        .expect(HttpStatus.OK)

      expect(response.body.config.frequencyMinutes).toBe(30)
    })

    it("should update multiple fields at once", async () => {
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

      const newStartDate = "2025-03-01T00:00:00.000Z"
      const newEndDate = "2030-03-01T00:00:00.000Z"
      const updateRequest = {
        schedulerStartDate: newStartDate,
        schedulerEndDate: newEndDate,
        frequencyMinutes: 15,
      }

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/oracle/registries/${registry.id}`)
        .send(updateRequest)
        .expect(HttpStatus.OK)

      expect(response.body.config.schedulerStartDate).toBe(newStartDate)
      expect(response.body.config.schedulerEndDate).toBe(newEndDate)
      expect(response.body.config.frequencyMinutes).toBe(15)
    })

    it("should return 404 when updating non-existent oracle registry", async () => {
      const nonExistentId = "00000000-0000-0000-0000-000000000000"

      const updateRequest = {
        frequencyMinutes: 30,
      }

      await request(app.getHttpServer())
        .patch(`/api/v1/oracle/registries/${nonExistentId}`)
        .send(updateRequest)
        .expect(HttpStatus.NOT_FOUND)
    })

    it("should return 400 when frequencyMinutes is less than 1", async () => {
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

      const updateRequest = {
        frequencyMinutes: 0,
      }

      await request(app.getHttpServer())
        .patch(`/api/v1/oracle/registries/${registry.id}`)
        .send(updateRequest)
        .expect(HttpStatus.BAD_REQUEST)
    })
  })
})
