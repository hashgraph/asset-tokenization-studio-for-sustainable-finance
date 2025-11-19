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

describe("CreateOracleRegistryHttpAdapter API Integration", () => {
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

  describe("POST /", () => {
    it("should create oracle registry with valid data", async () => {
      const timestamp = Date.now() + Math.floor(Math.random() * 100000)
      const createRequest = {
        bondContractId: `0.0.${timestamp}`,
        kpiContractId: `0.0.${timestamp + 1}`,
        projects: [
          { projectId: "project-1", topicId: `0.0.${timestamp + 2}` },
          { projectId: "project-2", topicId: `0.0.${timestamp + 3}` },
        ],
        schedulerStartDate: "2025-01-01T00:00:00.000Z",
        schedulerEndDate: "2030-01-01T00:00:00.000Z",
        frequencyMinutes: 60,
      }

      const response = await request(app.getHttpServer())
        .post("/api/v1/oracle/registries")
        .send(createRequest)
        .expect(HttpStatus.CREATED)

      expect(response.body).toMatchObject({
        id: expect.any(String),
        bondContractId: createRequest.bondContractId,
        kpiContractId: createRequest.kpiContractId,
        projects: createRequest.projects,
        config: {
          schedulerStartDate: createRequest.schedulerStartDate,
          schedulerEndDate: createRequest.schedulerEndDate,
          frequencyMinutes: createRequest.frequencyMinutes,
        },
        status: OracleStatus.ACTIVE,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      })

      const savedRegistry = await oracleRegistryRepository.findOne({
        where: { id: response.body.id },
      })

      expect(savedRegistry).toBeDefined()
      expect(savedRegistry?.bondContractId).toBe(createRequest.bondContractId)
      expect(savedRegistry?.kpiContractId).toBe(createRequest.kpiContractId)
    })

    it("should create oracle registry with null endDate", async () => {
      const timestamp = Date.now() + Math.floor(Math.random() * 100000)
      const createRequest = {
        bondContractId: `0.0.${timestamp}`,
        kpiContractId: `0.0.${timestamp + 1}`,
        projects: [{ projectId: "project-1", topicId: `0.0.${timestamp + 2}` }],
        schedulerStartDate: "2025-01-01T00:00:00.000Z",
        schedulerEndDate: null,
        frequencyMinutes: 30,
      }

      const response = await request(app.getHttpServer())
        .post("/api/v1/oracle/registries")
        .send(createRequest)
        .expect(HttpStatus.CREATED)

      expect(response.body.config.schedulerEndDate).toBeNull()
    })

    it("should create oracle registry without endDate field", async () => {
      const timestamp = Date.now() + Math.floor(Math.random() * 100000)
      const createRequest = {
        bondContractId: `0.0.${timestamp}`,
        kpiContractId: `0.0.${timestamp + 1}`,
        projects: [{ projectId: "project-1", topicId: `0.0.${timestamp + 2}` }],
        schedulerStartDate: "2025-01-01T00:00:00.000Z",
        frequencyMinutes: 30,
      }

      const response = await request(app.getHttpServer())
        .post("/api/v1/oracle/registries")
        .send(createRequest)
        .expect(HttpStatus.CREATED)

      expect(response.body.config.schedulerEndDate).toBeNull()
    })

    it("should return 400 when bondContractId is missing", async () => {
      const timestamp = Date.now() + Math.floor(Math.random() * 100000)
      const createRequest = {
        kpiContractId: `0.0.${timestamp}`,
        projects: [{ projectId: "project-1", topicId: `0.0.${timestamp + 1}` }],
        schedulerStartDate: "2025-01-01T00:00:00.000Z",
        frequencyMinutes: 60,
      }

      await request(app.getHttpServer())
        .post("/api/v1/oracle/registries")
        .send(createRequest)
        .expect(HttpStatus.BAD_REQUEST)
    })

    it("should return 400 when kpiContractId is missing", async () => {
      const timestamp = Date.now() + Math.floor(Math.random() * 100000)
      const createRequest = {
        bondContractId: `0.0.${timestamp}`,
        projects: [{ projectId: "project-1", topicId: `0.0.${timestamp + 1}` }],
        schedulerStartDate: "2025-01-01T00:00:00.000Z",
        frequencyMinutes: 60,
      }

      await request(app.getHttpServer())
        .post("/api/v1/oracle/registries")
        .send(createRequest)
        .expect(HttpStatus.BAD_REQUEST)
    })

    it("should return 400 when frequencyMinutes is less than 1", async () => {
      const timestamp = Date.now() + Math.floor(Math.random() * 100000)
      const createRequest = {
        bondContractId: `0.0.${timestamp}`,
        kpiContractId: `0.0.${timestamp + 1}`,
        projects: [{ projectId: "project-1", topicId: `0.0.${timestamp + 2}` }],
        schedulerStartDate: "2025-01-01T00:00:00.000Z",
        frequencyMinutes: 0,
      }

      await request(app.getHttpServer())
        .post("/api/v1/oracle/registries")
        .send(createRequest)
        .expect(HttpStatus.BAD_REQUEST)
    })

    it("should return 409 when kpiContractId already exists", async () => {
      const timestamp = Date.now() + Math.floor(Math.random() * 100000)
      const existingRegistry = await oracleRegistryRepository.save({
        bondContractId: `0.0.${timestamp}`,
        kpiContractId: `0.0.${timestamp + 1}`,
        projects: [{ projectId: "project-1", topicId: `0.0.${timestamp + 2}` }],
        schedulerStartDate: new Date("2025-01-01T00:00:00.000Z"),
        schedulerEndDate: null,
        nextExecutionDate: new Date("2025-01-02T00:00:00.000Z"),
        frequencyMinutes: 60,
        status: OracleStatus.ACTIVE,
      })

      const createRequest = {
        bondContractId: `0.0.${timestamp + 10}`,
        kpiContractId: existingRegistry.kpiContractId,
        projects: [{ projectId: "project-2", topicId: `0.0.${timestamp + 3}` }],
        schedulerStartDate: "2025-01-01T00:00:00.000Z",
        frequencyMinutes: 30,
      }

      await request(app.getHttpServer())
        .post("/api/v1/oracle/registries")
        .send(createRequest)
        .expect(HttpStatus.CONFLICT)
    })
  })
})
