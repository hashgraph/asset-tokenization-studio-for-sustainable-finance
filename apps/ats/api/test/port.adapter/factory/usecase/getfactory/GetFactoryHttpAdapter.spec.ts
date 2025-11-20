// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { HttpStatus, INestApplication } from "@nestjs/common"
import request from "supertest"
import { CONTROLLERS, PROVIDERS } from "../../../../../src/Components"
import { SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "../../../../shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"
import { Repository } from "typeorm"
import { getRepositoryToken } from "@nestjs/typeorm"
import { FactoryPersistence } from "@port/factory/persistence/model/FactoryPersistence"

describe("GetFactoryHttpAdapter API Integration", () => {
  let app: INestApplication
  let container: PostgreSqlContainer
  let internalFactoryRepository: Repository<FactoryPersistence>

  beforeAll(async () => {
    container = await PostgreSqlContainer.create()
  })

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SharedModule, PostgresModule.forRoot(container.getConfig())],
      controllers: CONTROLLERS,
      providers: [...PROVIDERS],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.setGlobalPrefix("api/v1/ats")
    app.useLogger(false)
    await app.init()
    internalFactoryRepository = app.get(getRepositoryToken(FactoryPersistence))
  })

  afterAll(async () => {
    await container.stop()
  })

  afterEach(async () => {
    if (app) {
      await app.close()
    }
  })

  describe("GET /factory/:factoryId", () => {
    it("should return 404 Http error when factory is not found", async () => {
      const factoryId = "0.0.9999999"

      await request(app.getHttpServer()).get(`/api/v1/ats/factory/${factoryId}`).send().expect(HttpStatus.NOT_FOUND)
    })

    it("should return factory details", async () => {
      const factory = await internalFactoryRepository.save({
        factoryId: "0.0.7247643",
        isPaused: false,
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/ats/factory/${factory.factoryId}`)
        .send()
        .expect(HttpStatus.OK)

      expect(response.body).toEqual({
        factoryId: factory.factoryId,
        isPaused: factory.isPaused,
        createdAt: expect.any(String),
      })
    })

    it("should return factory details when factory is paused", async () => {
      const factory = await internalFactoryRepository.save({
        factoryId: "0.0.1234567",
        isPaused: true,
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/ats/factory/${factory.factoryId}`)
        .send()
        .expect(HttpStatus.OK)

      expect(response.body).toEqual({
        factoryId: factory.factoryId,
        isPaused: true,
        createdAt: expect.any(String),
      })
    })
  })
})
