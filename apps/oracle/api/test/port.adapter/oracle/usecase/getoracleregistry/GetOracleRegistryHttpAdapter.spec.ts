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

describe("GetOracleRegistryHttpAdapter API Integration", () => {
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

  describe("GET /:id", () => {
    it("should return 404 Http error when oracle registry is not found", async () => {
      const registryId = "00000000-0000-0000-0000-000000000000"

      await request(app.getHttpServer())
        .get(`/api/v1/oracle/registries/${registryId}`)
        .send()
        .expect(HttpStatus.NOT_FOUND)
    })

    it("should return oracle registry details", async () => {
      const startDate = new Date("2025-01-01T00:00:00Z")
      const endDate = new Date("2030-01-01T00:00:00Z")
      const nextExecutionDate = new Date("2025-01-02T00:00:00Z")

      const registry = await oracleRegistryRepository.save({
        bondContractId: "0.0.6823801",
        kpiContractId: "0.0.6823802",
        projects: [
          { projectId: "project-1", topicId: "0.0.6823803" },
          { projectId: "project-2", topicId: "0.0.6823804" },
        ],
        schedulerStartDate: startDate,
        schedulerEndDate: endDate,
        nextExecutionDate: nextExecutionDate,
        frequencyMinutes: 60,
        status: OracleStatus.ACTIVE,
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/oracle/registries/${registry.id}`)
        .send()
        .expect(HttpStatus.OK)

      expect(response.body).toEqual({
        id: registry.id,
        bondContractId: registry.bondContractId,
        kpiContractId: registry.kpiContractId,
        projects: [
          { projectId: "project-1", topicId: "0.0.6823803" },
          { projectId: "project-2", topicId: "0.0.6823804" },
        ],
        config: {
          schedulerStartDate: startDate.toISOString(),
          schedulerEndDate: endDate.toISOString(),
          frequencyMinutes: 60,
        },
        status: OracleStatus.ACTIVE,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      })
    })

    it("should return oracle registry with null endDate", async () => {
      const startDate = new Date("2025-01-01T00:00:00Z")
      const nextExecutionDate = new Date("2025-01-02T00:00:00Z")

      const registry = await oracleRegistryRepository.save({
        bondContractId: "0.0.6823801",
        kpiContractId: "0.0.6823805",
        projects: [{ projectId: "project-1", topicId: "0.0.6823803" }],
        schedulerStartDate: startDate,
        schedulerEndDate: null,
        nextExecutionDate: nextExecutionDate,
        frequencyMinutes: 30,
        status: OracleStatus.ACTIVE,
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/oracle/registries/${registry.id}`)
        .send()
        .expect(HttpStatus.OK)

      expect(response.body.config.schedulerEndDate).toBeNull()
    })
  })
})
