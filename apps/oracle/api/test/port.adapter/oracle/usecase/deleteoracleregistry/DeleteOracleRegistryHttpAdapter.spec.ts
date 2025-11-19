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

describe("DeleteOracleRegistryHttpAdapter API Integration", () => {
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

  describe("DELETE /:id", () => {
    it("should delete oracle registry successfully", async () => {
      const startDate = new Date("2025-01-01T00:00:00Z")
      const nextExecutionDate = new Date("2025-01-02T00:00:00Z")

      const registry = await oracleRegistryRepository.save({
        bondContractId: "0.0.6823801",
        kpiContractId: "0.0.6823802",
        projects: [{ projectId: "project-1", topicId: "0.0.6823803" }],
        schedulerStartDate: startDate,
        schedulerEndDate: null,
        nextExecutionDate: nextExecutionDate,
        frequencyMinutes: 60,
        status: OracleStatus.ACTIVE,
      })

      await request(app.getHttpServer()).delete(`/api/v1/oracle/registries/${registry.id}`).expect(HttpStatus.OK)

      const deletedRegistry = await oracleRegistryRepository.findOne({
        where: { id: registry.id },
      })

      expect(deletedRegistry).toBeNull()
    })

    it("should return 404 when deleting non-existent oracle registry", async () => {
      const nonExistentId = "00000000-0000-0000-0000-000000000000"

      await request(app.getHttpServer())
        .delete(`/api/v1/oracle/registries/${nonExistentId}`)
        .expect(HttpStatus.NOT_FOUND)
    })
  })
})
