// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import request from "supertest"
import { SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgresModule } from "@config/PostgresModule"
import { CONTROLLERS, PROVIDERS } from "@components"
import { PostgreSqlContainer } from "@test/shared/containers/PostgresqlContainer"
import { DataSource, Repository } from "typeorm"
import { PrimaryMarketPersistence } from "@port/persistence/primarymarket/model/PrimaryMarketPersistence"
import { getRepositoryToken } from "@nestjs/typeorm"

describe("GetPrimaryMarket API Integration", () => {
  let app: INestApplication
  let container: PostgreSqlContainer
  let primaryMarketRepository: Repository<PrimaryMarketPersistence>

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
    app.setGlobalPrefix("api/v1/")
    app.useLogger(false)
    await app.init()

    primaryMarketRepository = app.get(getRepositoryToken(PrimaryMarketPersistence))
  })

  afterAll(async () => {
    await container.stop()
  })

  afterEach(async () => {
    const dataSource = app.get(DataSource)
    await dataSource.createQueryBuilder().delete().from("PrimaryMarket").execute()
    await app.close()
  })

  describe("GET /primary-markets/:marketContractId", () => {
    it("should return primary market with valid contract ID", async () => {
      const market = await primaryMarketRepository.save({
        contractId: "0.0.12345",
        isPaused: false,
      })

      const response = await request(app.getHttpServer()).get(`/api/v1/primary-markets/0.0.12345`).expect(200)

      expect(response.body).toMatchObject({
        id: market.id,
        contractId: "0.0.12345",
        isPaused: false,
      })
      expect(response.body).toHaveProperty("createdAt")
    })

    it("should return primary market with isPaused true", async () => {
      const market = await primaryMarketRepository.save({
        contractId: "0.0.67890",
        isPaused: true,
      })

      const response = await request(app.getHttpServer()).get(`/api/v1/primary-markets/0.0.67890`).expect(200)

      expect(response.body).toMatchObject({
        id: market.id,
        contractId: "0.0.67890",
        isPaused: true,
      })
      expect(response.body).toHaveProperty("createdAt")
    })

    it("should return 404 when primary market does not exist", async () => {
      const response = await request(app.getHttpServer()).get(`/api/v1/primary-markets/0.0.99999`).expect(404)

      expect(response.body).toHaveProperty("message")
    })

    it("should return different primary markets for different contract IDs", async () => {
      const market1 = await primaryMarketRepository.save({
        contractId: "0.0.11111",
        isPaused: false,
      })

      const market2 = await primaryMarketRepository.save({
        contractId: "0.0.22222",
        isPaused: true,
      })

      const response1 = await request(app.getHttpServer()).get(`/api/v1/primary-markets/0.0.11111`).expect(200)

      const response2 = await request(app.getHttpServer()).get(`/api/v1/primary-markets/0.0.22222`).expect(200)

      expect(response1.body.contractId).toBe("0.0.11111")
      expect(response1.body.isPaused).toBe(false)
      expect(response1.body.id).toBe(market1.id)

      expect(response2.body.contractId).toBe("0.0.22222")
      expect(response2.body.isPaused).toBe(true)
      expect(response2.body.id).toBe(market2.id)
    })

    it("should handle large contract IDs", async () => {
      const market = await primaryMarketRepository.save({
        contractId: "0.0.999999999",
        isPaused: false,
      })

      const response = await request(app.getHttpServer()).get(`/api/v1/primary-markets/0.0.999999999`).expect(200)

      expect(response.body.contractId).toBe("0.0.999999999")
      expect(response.body.id).toBe(market.id)
    })

    it("should return the correct primary market when multiple markets exist", async () => {
      await primaryMarketRepository.save({
        contractId: "0.0.11111",
        isPaused: false,
      })

      const targetMarket = await primaryMarketRepository.save({
        contractId: "0.0.22222",
        isPaused: true,
      })

      await primaryMarketRepository.save({
        contractId: "0.0.33333",
        isPaused: false,
      })

      const response = await request(app.getHttpServer()).get(`/api/v1/primary-markets/0.0.22222`).expect(200)

      expect(response.body.id).toBe(targetMarket.id)
      expect(response.body.contractId).toBe("0.0.22222")
      expect(response.body.isPaused).toBe(true)
    })

    it("should return primary market with all expected fields", async () => {
      await primaryMarketRepository.save({
        contractId: "0.0.12345",
        isPaused: false,
      })

      const response = await request(app.getHttpServer()).get(`/api/v1/primary-markets/0.0.12345`).expect(200)

      expect(response.body).toHaveProperty("id")
      expect(response.body).toHaveProperty("createdAt")
      expect(response.body).toHaveProperty("contractId")
      expect(response.body).toHaveProperty("isPaused")
      expect(typeof response.body.id).toBe("string")
      expect(typeof response.body.createdAt).toBe("string")
      expect(typeof response.body.contractId).toBe("string")
      expect(typeof response.body.isPaused).toBe("boolean")
    })
  })
})
