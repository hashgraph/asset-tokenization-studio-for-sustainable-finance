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
import { OfferingPersistence } from "@port/persistence/offering/model/OfferingPersistence"
import { getRepositoryToken } from "@nestjs/typeorm"

describe("GetOffering API Integration", () => {
  let app: INestApplication
  let container: PostgreSqlContainer
  let primaryMarketRepository: Repository<PrimaryMarketPersistence>
  let offeringRepository: Repository<OfferingPersistence>

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
    offeringRepository = app.get(getRepositoryToken(OfferingPersistence))
  })

  afterAll(async () => {
    await container.stop()
  })

  afterEach(async () => {
    const dataSource = app.get(DataSource)
    await dataSource.createQueryBuilder().delete().from("Offering").execute()
    await dataSource.createQueryBuilder().delete().from("PrimaryMarket").execute()
    await app.close()
  })

  describe("GET /primary-markets/:marketContractId/offerings/:offeringDltId", () => {
    it("should return offering with valid parameters", async () => {
      const market = await primaryMarketRepository.save({
        contractId: "0.0.12345",
        isPaused: false,
      })

      await offeringRepository.save({
        offeringDltId: "1",
        market,
        bondContractId: "0.0.9999999",
        operatorAccountId: "0.0.4660",
        treasuryContractId: "0.0.8888888",
        paymentTokenContractId: "0.0.7777777",
        lotSize: "1000",
        minQuantity: "100",
        maxQuantity: "10000",
        targetQuantity: "5000",
        targetQuantityRule: 0,
        startDate: new Date("2023-01-01"),
        endDate: new Date("2024-01-01"),
        deadlineRule: 0,
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/primary-markets/0.0.12345/offerings/1`)
        .expect(200)

      expect(response.body).toMatchObject({
        offeringDltId: "1",
        bondContractId: "0.0.9999999",
        operatorAccountId: "0.0.4660",
        treasuryContractId: "0.0.8888888",
        paymentTokenContractId: "0.0.7777777",
        lotSize: "1000",
        minQuantity: "100",
        maxQuantity: "10000",
        targetQuantity: "5000",
        targetQuantityRule: 0,
        deadlineRule: 0,
      })
      expect(response.body).toHaveProperty("startDate")
      expect(response.body).toHaveProperty("endDate")
      expect(response.body).toHaveProperty("createdAt")
    })

    it("should return offering with all required fields", async () => {
      const market = await primaryMarketRepository.save({
        contractId: "0.0.12345",
        isPaused: false,
      })

      await offeringRepository.save({
        offeringDltId: "2",
        market,
        bondContractId: "0.0.111",
        operatorAccountId: "0.0.4660",
        treasuryContractId: "0.0.222",
        paymentTokenContractId: "0.0.333",
        lotSize: "2000",
        minQuantity: "200",
        maxQuantity: "20000",
        targetQuantity: "10000",
        targetQuantityRule: 1,
        startDate: new Date("2023-02-01"),
        endDate: new Date("2024-02-01"),
        deadlineRule: 1,
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/primary-markets/0.0.12345/offerings/2`)
        .expect(200)

      expect(response.body).toHaveProperty("offeringDltId")
      expect(response.body).toHaveProperty("bondContractId")
      expect(response.body).toHaveProperty("operatorAccountId")
      expect(response.body).toHaveProperty("treasuryContractId")
      expect(response.body).toHaveProperty("paymentTokenContractId")
      expect(response.body).toHaveProperty("lotSize")
      expect(response.body).toHaveProperty("minQuantity")
      expect(response.body).toHaveProperty("maxQuantity")
      expect(response.body).toHaveProperty("targetQuantity")
      expect(response.body).toHaveProperty("targetQuantityRule")
      expect(response.body).toHaveProperty("startDate")
      expect(response.body).toHaveProperty("endDate")
      expect(response.body).toHaveProperty("deadlineRule")
      expect(response.body).toHaveProperty("createdAt")
    })

    it("should return 404 when primary market does not exist", async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/primary-markets/0.0.99999/offerings/1`)
        .expect(404)

      expect(response.body.message).toContain("PrimaryMarket not found for contract id: 0.0.99999")
    })

    it("should return 404 when offering does not exist", async () => {
      await primaryMarketRepository.save({
        contractId: "0.0.12345",
        isPaused: false,
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/primary-markets/0.0.12345/offerings/999`)
        .expect(404)

      expect(response.body.message).toContain(
        "Offering not found for offering dlt id: 999 and market contract id: 0.0.12345",
      )
    })

    it("should return 404 when offering exists in a different market", async () => {
      await primaryMarketRepository.save({
        contractId: "0.0.12345",
        isPaused: false,
      })

      const market2 = await primaryMarketRepository.save({
        contractId: "0.0.54321",
        isPaused: false,
      })

      await offeringRepository.save({
        offeringDltId: "1",
        market: market2,
        bondContractId: "0.0.9999999",
        operatorAccountId: "0.0.4660",
        treasuryContractId: "0.0.8888888",
        paymentTokenContractId: "0.0.7777777",
        lotSize: "1000",
        minQuantity: "100",
        maxQuantity: "10000",
        targetQuantity: "5000",
        targetQuantityRule: 0,
        startDate: new Date("2023-01-01"),
        endDate: new Date("2024-01-01"),
        deadlineRule: 0,
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/primary-markets/0.0.12345/offerings/1`)
        .expect(404)

      expect(response.body.message).toContain(
        "Offering not found for offering dlt id: 1 and market contract id: 0.0.12345",
      )
    })
  })
})
