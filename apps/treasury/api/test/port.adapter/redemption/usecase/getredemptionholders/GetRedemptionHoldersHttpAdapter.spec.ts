// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import request from "supertest"
import { Repository } from "typeorm"
import { getRepositoryToken } from "@nestjs/typeorm"
import { CONTROLLERS, PROVIDERS } from "../../../../../src/Components"
import { SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "../../../../shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"
import { TreasuryPersistence } from "@port/persistence/treasury/model/TreasuryPersistence"
import { RedemptionHolderPersistence } from "@port/persistence/redemption/model/RedemptionHolderPersistence"
import { PaymentTokenPersistence } from "@port/persistence/paymenttoken/model/PaymentTokenPersistence"
import { RedemptionHolderStatus } from "@domain/redemption/model/RedemptionHolderStatus"

describe("GetRedemptionHolders API Integration", () => {
  let app: INestApplication
  let container: PostgreSqlContainer
  let internalTreasuryRepository: Repository<TreasuryPersistence>
  let internalRedemptionHolderRepository: Repository<RedemptionHolderPersistence>
  let internalPaymentTokenRepository: Repository<PaymentTokenPersistence>

  beforeAll(async () => {
    container = await PostgreSqlContainer.create()
  })

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SharedModule, PostgresModule.forRoot(container.getConfig())],
      controllers: CONTROLLERS,
      providers: PROVIDERS,
    }).compile()

    app = moduleFixture.createNestApplication()
    app.setGlobalPrefix("api/v1")
    await app.init()

    internalTreasuryRepository = moduleFixture.get<Repository<TreasuryPersistence>>(
      getRepositoryToken(TreasuryPersistence),
    )
    internalRedemptionHolderRepository = moduleFixture.get<Repository<RedemptionHolderPersistence>>(
      getRepositoryToken(RedemptionHolderPersistence),
    )
    internalPaymentTokenRepository = moduleFixture.get<Repository<PaymentTokenPersistence>>(
      getRepositoryToken(PaymentTokenPersistence),
    )
  })

  afterAll(async () => {
    await container.stop()
  })

  afterEach(async () => {
    await internalRedemptionHolderRepository.deleteAll()
    await internalPaymentTokenRepository.deleteAll()
    await internalTreasuryRepository.deleteAll()
    if (app) {
      await app.close()
    }
  })

  describe("GET /treasuries/:treasuryContractId/redemptions", () => {
    it("should return empty list when treasury has no redemption holders", async () => {
      const treasury = await internalTreasuryRepository.save({
        contractId: "0.0.123456",
        bondContractId: "0.0.789012",
        paused: false,
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/treasuries/${treasury.contractId}/redemptions`)
        .query({ page: 1, limit: 10 })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty("items")
      expect(response.body.items).toEqual([])
      expect(response.body).toHaveProperty("total")
      expect(response.body).toHaveProperty("page")
      expect(response.body).toHaveProperty("limit")
      expect(response.body).toHaveProperty("totalPages")
    })

    it("should return redemption holders for existing treasury", async () => {
      const treasury = await internalTreasuryRepository.save({
        contractId: "0.0.123456",
        bondContractId: "0.0.789012",
        paused: false,
      })

      const paymentToken = await internalPaymentTokenRepository.save({
        contractId: "0.0.111111",
        treasuryId: treasury.id,
        decimals: 2,
      })

      const holder1 = await internalRedemptionHolderRepository.save({
        holderAccountId: "0.0.111",
        status: RedemptionHolderStatus.SUCCESS,
        amount: "100000",
        treasuryId: treasury.id,
        paymentTokenId: paymentToken.id,
      })

      const holder2 = await internalRedemptionHolderRepository.save({
        holderAccountId: "0.0.222",
        status: RedemptionHolderStatus.FAILED,
        treasuryId: treasury.id,
        paymentTokenId: paymentToken.id,
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/treasuries/${treasury.contractId}/redemptions`)
        .query({ page: 1, limit: 10 })
        .expect(200)

      expect(response.body.total).toBe(2)
      expect(response.body.page).toBe(1)
      expect(response.body.limit).toBe(10)
      expect(response.body.totalPages).toBe(1)
      expect(response.body.items).toHaveLength(2)

      const item1 = response.body.items.find((item: any) => item.accountId === holder1.holderAccountId)
      const item2 = response.body.items.find((item: any) => item.accountId === holder2.holderAccountId)

      expect(item1).toMatchObject({
        accountId: "0.0.111",
        status: "SUCCESS",
        amount: "1000",
      })

      expect(item2).toMatchObject({
        accountId: "0.0.222",
        status: "FAILED",
        amount: null,
      })
    })

    it("should filter by SUCCESS status", async () => {
      const treasury = await internalTreasuryRepository.save({
        contractId: "0.0.123456",
        bondContractId: "0.0.789012",
        paused: false,
      })

      const paymentToken = await internalPaymentTokenRepository.save({
        contractId: "0.0.111111",
        treasuryId: treasury.id,
        decimals: 2,
      })

      await internalRedemptionHolderRepository.save({
        holderAccountId: "0.0.111",
        status: RedemptionHolderStatus.SUCCESS,
        amount: "100000",
        treasuryId: treasury.id,
        paymentTokenId: paymentToken.id,
      })

      await internalRedemptionHolderRepository.save({
        holderAccountId: "0.0.222",
        status: RedemptionHolderStatus.FAILED,
        treasuryId: treasury.id,
        paymentTokenId: paymentToken.id,
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/treasuries/${treasury.contractId}/redemptions`)
        .query({ page: 1, limit: 10, status: "SUCCESS" })
        .expect(200)

      expect(response.body.total).toBe(1)
      expect(response.body.items).toHaveLength(1)
      expect(response.body.items[0].status).toBe("SUCCESS")
      expect(response.body.items[0].accountId).toBe("0.0.111")
    })

    it("should filter by FAILED status", async () => {
      const treasury = await internalTreasuryRepository.save({
        contractId: "0.0.123456",
        bondContractId: "0.0.789012",
        paused: false,
      })

      const paymentToken = await internalPaymentTokenRepository.save({
        contractId: "0.0.111111",
        treasuryId: treasury.id,
        decimals: 2,
      })

      await internalRedemptionHolderRepository.save({
        holderAccountId: "0.0.111",
        status: RedemptionHolderStatus.SUCCESS,
        amount: "100000",
        treasuryId: treasury.id,
        paymentTokenId: paymentToken.id,
      })

      await internalRedemptionHolderRepository.save({
        holderAccountId: "0.0.222",
        status: RedemptionHolderStatus.FAILED,
        treasuryId: treasury.id,
        paymentTokenId: paymentToken.id,
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/treasuries/${treasury.contractId}/redemptions`)
        .query({ page: 1, limit: 10, status: "FAILED" })
        .expect(200)

      expect(response.body.total).toBe(1)
      expect(response.body.items).toHaveLength(1)
      expect(response.body.items[0].status).toBe("FAILED")
      expect(response.body.items[0].accountId).toBe("0.0.222")
    })

    it("should handle pagination parameters", async () => {
      const treasury = await internalTreasuryRepository.save({
        contractId: "0.0.123456",
        bondContractId: "0.0.789012",
        paused: false,
      })

      const paymentToken = await internalPaymentTokenRepository.save({
        contractId: "0.0.111111",
        treasuryId: treasury.id,
        decimals: 2,
      })

      for (let i = 1; i <= 5; i++) {
        await internalRedemptionHolderRepository.save({
          holderAccountId: `0.0.${i}`,
          status: RedemptionHolderStatus.SUCCESS,
          amount: "100000",
          treasuryId: treasury.id,
          paymentTokenId: paymentToken.id,
        })
      }

      const response = await request(app.getHttpServer())
        .get(`/api/v1/treasuries/${treasury.contractId}/redemptions`)
        .query({ page: 1, limit: 3 })
        .expect(200)

      expect(response.body.total).toBe(5)
      expect(response.body.page).toBe(1)
      expect(response.body.limit).toBe(3)
      expect(response.body.totalPages).toBe(2)
      expect(response.body.items).toHaveLength(3)
    })

    it("should return 404 for non-existent treasury", async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/treasuries/0.0.999999/redemptions`)
        .query({ page: 1, limit: 10 })
        .expect(404)

      expect(response.body).toHaveProperty("message")
    })

    it("should return 400 for invalid status parameter", async () => {
      const treasury = await internalTreasuryRepository.save({
        contractId: "0.0.123456",
        bondContractId: "0.0.789012",
        paused: false,
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/treasuries/${treasury.contractId}/redemptions`)
        .query({ page: 1, limit: 10, status: "INVALID" })
        .expect(400)

      expect(response.body).toHaveProperty("message")
    })
  })
})
