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
import { ProceedsRecipientPersistence } from "@port/persistence/proceedsrecipient/model/ProceedsRecipientPersistence"
import { ProceedsRecipientAllocationPersistence } from "@port/persistence/proceedsrecipient/model/ProceedsRecipientAllocationPersistence"

describe("GetProceedsRecipientAllocations API Integration", () => {
  let app: INestApplication
  let container: PostgreSqlContainer
  let internalTreasuryRepository: Repository<TreasuryPersistence>
  let internalPaymentTokenRepository: Repository<PaymentTokenPersistence>
  let internalProceedsRecipientRepository: Repository<ProceedsRecipientPersistence>
  let internalProceedsRecipientAllocationRepository: Repository<ProceedsRecipientAllocationPersistence>

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
    internalPaymentTokenRepository = moduleFixture.get<Repository<PaymentTokenPersistence>>(
      getRepositoryToken(PaymentTokenPersistence),
    )
    internalProceedsRecipientRepository = moduleFixture.get<Repository<ProceedsRecipientPersistence>>(
      getRepositoryToken(ProceedsRecipientPersistence),
    )
    internalProceedsRecipientAllocationRepository = moduleFixture.get<
      Repository<ProceedsRecipientAllocationPersistence>
    >(getRepositoryToken(ProceedsRecipientAllocationPersistence))
  })

  afterAll(async () => {
    await container.stop()
  })

  afterEach(async () => {
    await internalProceedsRecipientAllocationRepository.deleteAll()
    await internalProceedsRecipientRepository.deleteAll()
    await internalPaymentTokenRepository.deleteAll()
    await internalTreasuryRepository.deleteAll()
    if (app) {
      await app.close()
    }
  })

  describe("GET /:treasuryContractId/proceeds-recipients/:recipientContractId/allocations", () => {
    it("should return empty list when proceeds recipient has no allocations", async () => {
      const treasury = await internalTreasuryRepository.save({
        contractId: "0.0.123456",
        bondContractId: "0.0.789012",
        paused: false,
      })

      const proceedsRecipient = await internalProceedsRecipientRepository.save({
        contractId: "0.0.111111",
        treasuryId: treasury.id,
        treasury: treasury,
      })

      const response = await request(app.getHttpServer())
        .get(
          `/api/v1/treasuries/${treasury.contractId}/proceeds-recipients/${proceedsRecipient.contractId}/allocations`,
        )
        .query({ page: 1, limit: 10 })

      if (response.status !== 200) {
        console.log("Error response:", response.status, response.body)
      }

      expect(response.status).toBe(200)

      expect(response.body).toHaveProperty("items")
      expect(response.body.items).toEqual([])
      expect(response.body).toHaveProperty("total")
      expect(response.body).toHaveProperty("page")
      expect(response.body).toHaveProperty("limit")
      expect(response.body).toHaveProperty("totalPages")
    })

    it("should return allocations for existing proceeds recipient", async () => {
      const treasury = await internalTreasuryRepository.save({
        contractId: "0.0.123456",
        bondContractId: "0.0.789012",
        paused: false,
      })

      const paymentToken = await internalPaymentTokenRepository.save({
        contractId: "0.0.333",
        treasuryId: treasury.id,
        decimals: 8,
        treasury: treasury,
      })

      const proceedsRecipient = await internalProceedsRecipientRepository.save({
        contractId: "0.0.111111",
        treasuryId: treasury.id,
        treasury: treasury,
      })

      await internalProceedsRecipientAllocationRepository.save({
        proceedsRecipientId: proceedsRecipient.id,
        paymentTokenId: paymentToken.id,
        amount: "1000",
        proceedsRecipient: proceedsRecipient,
        paymentToken: paymentToken,
      })

      await internalProceedsRecipientAllocationRepository.save({
        proceedsRecipientId: proceedsRecipient.id,
        paymentTokenId: paymentToken.id,
        amount: "2000",
        proceedsRecipient: proceedsRecipient,
        paymentToken: paymentToken,
      })

      const response = await request(app.getHttpServer())
        .get(
          `/api/v1/treasuries/${treasury.contractId}/proceeds-recipients/${proceedsRecipient.contractId}/allocations`,
        )
        .query({ page: 1, limit: 10 })
        .expect(200)

      expect(response.body.total).toBe(2)
      expect(response.body.page).toBe(1)
      expect(response.body.limit).toBe(10)
      expect(response.body.totalPages).toBe(1)
      expect(response.body.items).toHaveLength(2)

      const item1 = response.body.items.find((item: any) => item.amount === "0.00001")
      const item2 = response.body.items.find((item: any) => item.amount === "0.00002")

      expect(item1).toEqual({
        paymentTokenId: expect.any(String),
        amount: "0.00001",
        createdAt: expect.any(String),
      })

      expect(item2).toEqual({
        paymentTokenId: expect.any(String),
        amount: "0.00002",
        createdAt: expect.any(String),
      })
    })

    it("should handle pagination parameters", async () => {
      const treasury = await internalTreasuryRepository.save({
        contractId: "0.0.123456",
        bondContractId: "0.0.789012",
        paused: false,
      })

      const paymentToken = await internalPaymentTokenRepository.save({
        contractId: "0.0.333",
        treasuryId: treasury.id,
        decimals: 8,
        treasury: treasury,
      })

      const proceedsRecipient = await internalProceedsRecipientRepository.save({
        contractId: "0.0.111111",
        treasuryId: treasury.id,
        treasury: treasury,
      })

      for (let i = 1; i <= 5; i++) {
        await internalProceedsRecipientAllocationRepository.save({
          proceedsRecipientId: proceedsRecipient.id,
          paymentTokenId: paymentToken.id,
          amount: `${i * 1000}`,
          proceedsRecipient: proceedsRecipient,
          paymentToken: paymentToken,
        })
      }

      const response = await request(app.getHttpServer())
        .get(
          `/api/v1/treasuries/${treasury.contractId}/proceeds-recipients/${proceedsRecipient.contractId}/allocations`,
        )
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

      const paymentToken = await internalPaymentTokenRepository.save({
        contractId: "0.0.333",
        treasuryId: treasury.id,
        decimals: 8,
        treasury: treasury,
      })

      const proceedsRecipient = await internalProceedsRecipientRepository.save({
        contractId: "0.0.111111",
        treasuryId: treasury.id,
        treasury: treasury,
      })

      await internalProceedsRecipientAllocationRepository.save({
        proceedsRecipientId: proceedsRecipient.id,
        paymentTokenId: paymentToken.id,
        amount: "1000",
        proceedsRecipient: proceedsRecipient,
        paymentToken: paymentToken,
      })

      await new Promise((resolve) => setTimeout(resolve, 10))

      await internalProceedsRecipientAllocationRepository.save({
        proceedsRecipientId: proceedsRecipient.id,
        paymentTokenId: paymentToken.id,
        amount: "2000",
      })

      const response = await request(app.getHttpServer())
        .get(
          `/api/v1/treasuries/${treasury.contractId}/proceeds-recipients/${proceedsRecipient.contractId}/allocations`,
        )
        .query({ page: 1, limit: 10, orderBy: "createdAt", order: "ASC" })
        .expect(200)

      expect(response.body.items).toHaveLength(2)
      expect(response.body.items[0].amount).toBe("0.00001")
      expect(response.body.items[1].amount).toBe("0.00002")
    })

    it("should return 404 when treasury does not exist", async () => {
      const nonExistentTreasuryId = "0.0.999999"
      const recipientId = "0.0.111111"

      const response = await request(app.getHttpServer())
        .get(`/api/v1/treasuries/${nonExistentTreasuryId}/proceeds-recipients/${recipientId}/allocations`)
        .expect(404)

      expect(response.body.message).toBe(`Treasury not found for the contract id: ${nonExistentTreasuryId}.`)
    })

    it("should return 404 when proceeds recipient does not belong to treasury", async () => {
      const treasury = await internalTreasuryRepository.save({
        contractId: "0.0.123456",
        bondContractId: "0.0.789012",
        paused: false,
      })

      const nonExistentRecipientId = "0.0.111111"

      const response = await request(app.getHttpServer())
        .get(`/api/v1/treasuries/${treasury.contractId}/proceeds-recipients/${nonExistentRecipientId}/allocations`)
        .expect(404)

      expect(response.body.message).toBe(`ProceedsRecipient with contractId ${nonExistentRecipientId} not found`)
    })

    it("should filter allocations by proceeds recipient", async () => {
      const treasury = await internalTreasuryRepository.save({
        contractId: "0.0.123456",
        bondContractId: "0.0.789012",
        paused: false,
      })

      const paymentToken = await internalPaymentTokenRepository.save({
        contractId: "0.0.333",
        treasuryId: treasury.id,
        decimals: 8,
        treasury: treasury,
      })

      const proceedsRecipient1 = await internalProceedsRecipientRepository.save({
        contractId: "0.0.111111",
        treasuryId: treasury.id,
        treasury: treasury,
      })

      const proceedsRecipient2 = await internalProceedsRecipientRepository.save({
        contractId: "0.0.222222",
        treasuryId: treasury.id,
        treasury: treasury,
      })

      await internalProceedsRecipientAllocationRepository.save({
        proceedsRecipientId: proceedsRecipient1.id,
        paymentTokenId: paymentToken.id,
        amount: "1000",
        proceedsRecipient: proceedsRecipient1,
        paymentToken: paymentToken,
      })

      await internalProceedsRecipientAllocationRepository.save({
        proceedsRecipientId: proceedsRecipient2.id,
        paymentTokenId: paymentToken.id,
        amount: "2000",
        proceedsRecipient: proceedsRecipient2,
        paymentToken: paymentToken,
      })

      const response = await request(app.getHttpServer())
        .get(
          `/api/v1/treasuries/${treasury.contractId}/proceeds-recipients/${proceedsRecipient1.contractId}/allocations`,
        )
        .query({ page: 1, limit: 10 })
        .expect(200)

      expect(response.body.total).toBe(1)
      expect(response.body.items).toHaveLength(1)
      expect(response.body.items[0].amount).toBe("0.00001")
    })

    it("should return allocations with correct structure", async () => {
      const treasury = await internalTreasuryRepository.save({
        contractId: "0.0.123456",
        bondContractId: "0.0.789012",
        paused: false,
      })

      const paymentToken = await internalPaymentTokenRepository.save({
        contractId: "0.0.333",
        treasuryId: treasury.id,
        decimals: 8,
        treasury: treasury,
      })

      const proceedsRecipient = await internalProceedsRecipientRepository.save({
        contractId: "0.0.111111",
        treasuryId: treasury.id,
        treasury: treasury,
      })

      await internalProceedsRecipientAllocationRepository.save({
        proceedsRecipientId: proceedsRecipient.id,
        paymentTokenId: paymentToken.id,
        amount: "1000",
        proceedsRecipient: proceedsRecipient,
        paymentToken: paymentToken,
      })

      const response = await request(app.getHttpServer())
        .get(
          `/api/v1/treasuries/${treasury.contractId}/proceeds-recipients/${proceedsRecipient.contractId}/allocations`,
        )
        .query({ page: 1, limit: 10 })
        .expect(200)

      expect(response.body.items).toHaveLength(1)
      expect(response.body.items[0]).toEqual({
        paymentTokenId: expect.any(String),
        amount: "0.00001",
        createdAt: expect.any(String),
      })

      // Verify that createdAt is a valid ISO date string
      expect(new Date(response.body.items[0].createdAt)).toBeInstanceOf(Date)
    })
  })
})
