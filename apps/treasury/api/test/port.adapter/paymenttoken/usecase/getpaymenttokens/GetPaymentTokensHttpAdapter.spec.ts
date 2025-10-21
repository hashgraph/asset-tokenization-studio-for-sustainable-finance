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
import { PaymentTokenPersistence } from "@port/persistence/paymenttoken/model/PaymentTokenPersistence"

describe("GetPaymentTokens API Integration", () => {
  let app: INestApplication
  let container: PostgreSqlContainer
  let internalTreasuryRepository: Repository<TreasuryPersistence>
  let paymentTokenRepository: Repository<PaymentTokenPersistence>

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
    paymentTokenRepository = moduleFixture.get<Repository<PaymentTokenPersistence>>(
      getRepositoryToken(PaymentTokenPersistence),
    )
  })

  afterAll(async () => {
    await container.stop()
  })

  afterEach(async () => {
    await paymentTokenRepository.deleteAll()
    await internalTreasuryRepository.deleteAll()
    if (app) {
      await app.close()
    }
  })

  describe("GET /treasuries/:treasuryContractId/payment-tokens", () => {
    it("should return empty list when treasury has no payment tokens", async () => {
      const treasury = await internalTreasuryRepository.save({
        contractId: "0.0.123456",
        bondContractId: "0.0.789012",
        paused: false,
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/treasuries/${treasury.contractId}/payment-tokens`)
        .expect(200)

      expect(response.body).toEqual({
        items: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      })
    })

    it("should return payment tokens for existing treasury", async () => {
      const treasury = await internalTreasuryRepository.save({
        contractId: "0.0.123456",
        bondContractId: "0.0.789012",
        paused: false,
      })

      const token1 = await paymentTokenRepository.save({
        contractId: "0.0.111111",
        treasuryId: treasury.id,
      })

      const token2 = await paymentTokenRepository.save({
        contractId: "0.0.222222",
        treasuryId: treasury.id,
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/treasuries/${treasury.contractId}/payment-tokens`)
        .expect(200)

      expect(response.body.total).toBe(2)
      expect(response.body.page).toBe(1)
      expect(response.body.limit).toBe(10)
      expect(response.body.totalPages).toBe(1)
      expect(response.body.items).toHaveLength(2)

      // Ordenar los items por contractId para hacer las validaciones determinísticas
      const sortedItems = response.body.items.sort((a: any, b: any) => a.contractId.localeCompare(b.contractId))

      expect(sortedItems[0]).toEqual({
        contractId: "0.0.111111",
        additionDate: token1.createdAt.toISOString(),
        removalDate: null,
      })

      expect(sortedItems[1]).toEqual({
        contractId: "0.0.222222",
        additionDate: token2.createdAt.toISOString(),
        removalDate: null,
      })
    })

    it("should return payment tokens with removal dates", async () => {
      const treasury = await internalTreasuryRepository.save({
        contractId: "0.0.123456",
        bondContractId: "0.0.789012",
        paused: false,
      })

      const removalDate = new Date("2023-06-15T10:30:00.000Z")

      const token1 = await paymentTokenRepository.save({
        contractId: "0.0.111111",
        treasuryId: treasury.id,
      })

      const token2 = await paymentTokenRepository.save({
        contractId: "0.0.222222",
        treasuryId: treasury.id,
        removalDate: removalDate,
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/treasuries/${treasury.contractId}/payment-tokens`)
        .expect(200)

      expect(response.body.total).toBe(2)
      expect(response.body.items).toHaveLength(2)

      // Ordenar los items por contractId para hacer las validaciones determinísticas
      const sortedItems = response.body.items.sort((a: any, b: any) => a.contractId.localeCompare(b.contractId))

      expect(sortedItems[0]).toEqual({
        contractId: "0.0.111111",
        additionDate: token1.createdAt.toISOString(),
        removalDate: null,
      })

      expect(sortedItems[1]).toEqual({
        contractId: "0.0.222222",
        additionDate: token2.createdAt.toISOString(),
        removalDate: removalDate.toISOString(),
      })
    })

    it("should handle pagination parameters", async () => {
      const treasury = await internalTreasuryRepository.save({
        contractId: "0.0.123456",
        bondContractId: "0.0.789012",
        paused: false,
      })

      for (let i = 1; i <= 5; i++) {
        await paymentTokenRepository.save({
          contractId: `0.0.${111110 + i}`,
          treasuryId: treasury.id,
        })
      }

      const response = await request(app.getHttpServer())
        .get(`/api/v1/treasuries/${treasury.contractId}/payment-tokens`)
        .query({ page: 1, limit: 3 })
        .expect(200)

      expect(response.body.total).toBe(5)
      expect(response.body.page).toBe(1)
      expect(response.body.limit).toBe(3)
      expect(response.body.totalPages).toBe(2)
      expect(response.body.items).toHaveLength(3)
    })

    it("should handle ordering parameters", async () => {
      const treasury = await internalTreasuryRepository.save({
        contractId: "0.0.123456",
        bondContractId: "0.0.789012",
        paused: false,
      })

      const token1 = await paymentTokenRepository.save({
        contractId: "0.0.111111",
        treasuryId: treasury.id,
      })

      await new Promise((resolve) => setTimeout(resolve, 10))

      const token2 = await paymentTokenRepository.save({
        contractId: "0.0.222222",
        treasuryId: treasury.id,
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/treasuries/${treasury.contractId}/payment-tokens`)
        .query({ orderBy: "createdAt", order: "ASC" })
        .expect(200)

      expect(response.body.items).toHaveLength(2)
      expect(response.body.items[0].contractId).toBe(token1.contractId)
      expect(response.body.items[1].contractId).toBe(token2.contractId)
    })

    it("should return 404 when treasury does not exist", async () => {
      const nonExistentTreasuryId = "0.0.999999"

      await request(app.getHttpServer()).get(`/api/v1/treasuries/${nonExistentTreasuryId}/payment-tokens`).expect(404)
    })
  })
})
