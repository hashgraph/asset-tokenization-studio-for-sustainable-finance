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

describe("AddProjectHttpAdapter API Integration", () => {
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

  describe("POST /:id/projects", () => {
    it("should add project to oracle registry", async () => {
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

      const addProjectRequest = {
        projectId: "project-2",
        topicId: `0.0.${timestamp + 3}`,
      }

      const response = await request(app.getHttpServer())
        .post(`/api/v1/oracle/registries/${registry.id}/projects`)
        .send(addProjectRequest)
        .expect(HttpStatus.CREATED)

      expect(response.body.projects).toHaveLength(2)
      expect(response.body.projects).toEqual(
        expect.arrayContaining([
          { projectId: "project-1", topicId: `0.0.${timestamp + 2}` },
          { projectId: "project-2", topicId: `0.0.${timestamp + 3}` },
        ]),
      )

      const updatedRegistry = await oracleRegistryRepository.findOne({
        where: { id: registry.id },
      })
      expect(updatedRegistry?.projects).toHaveLength(2)
    })

    it("should return 404 when adding project to non-existent oracle registry", async () => {
      const timestamp = Date.now() + Math.floor(Math.random() * 100000)
      const nonExistentId = "00000000-0000-0000-0000-000000000000"

      const addProjectRequest = {
        projectId: "project-2",
        topicId: `0.0.${timestamp}`,
      }

      await request(app.getHttpServer())
        .post(`/api/v1/oracle/registries/${nonExistentId}/projects`)
        .send(addProjectRequest)
        .expect(HttpStatus.NOT_FOUND)
    })

    it("should return 400 when projectId is missing", async () => {
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

      const addProjectRequest = {
        topicId: `0.0.${timestamp + 3}`,
      }

      await request(app.getHttpServer())
        .post(`/api/v1/oracle/registries/${registry.id}/projects`)
        .send(addProjectRequest)
        .expect(HttpStatus.BAD_REQUEST)
    })

    it("should return 400 when topicId is missing", async () => {
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

      const addProjectRequest = {
        projectId: "project-2",
      }

      await request(app.getHttpServer())
        .post(`/api/v1/oracle/registries/${registry.id}/projects`)
        .send(addProjectRequest)
        .expect(HttpStatus.BAD_REQUEST)
    })
  })
})
