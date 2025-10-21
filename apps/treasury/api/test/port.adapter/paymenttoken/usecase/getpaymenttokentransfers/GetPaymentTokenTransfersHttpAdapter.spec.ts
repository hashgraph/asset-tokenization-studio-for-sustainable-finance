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
import { PaymentTokenTransferPersistence } from "@port/persistence/paymenttoken/model/PaymentTokenTransferPersistence"
import { TransferType } from "@domain/shared/model/TransferType"

describe("GetPaymentTokenTransfers API Integration", () => {
  let app: INestApplication
  let container: PostgreSqlContainer
  let internalTreasuryRepository: Repository<TreasuryPersistence>
  let internalPaymentTokenRepository: Repository<PaymentTokenPersistence>
  let internalPaymentTokenTransferRepository: Repository<PaymentTokenTransferPersistence>

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
    internalPaymentTokenTransferRepository = moduleFixture.get<Repository<PaymentTokenTransferPersistence>>(
      getRepositoryToken(PaymentTokenTransferPersistence),
    )
  })

  afterAll(async () => {
    await container.stop()
  })

  afterEach(async () => {
    await internalPaymentTokenTransferRepository.deleteAll()
    await internalPaymentTokenRepository.deleteAll()
    await internalTreasuryRepository.deleteAll()
    if (app) {
      await app.close()
    }
  })

  describe("GET /:treasuryContractId/payment-tokens/:paymentTokenContractId/transfers", () => {
    it("should return empty list when payment token has no transfers", async () => {
      const treasury = await internalTreasuryRepository.save({
        contractId: "0.0.123456",
        bondContractId: "0.0.789012",
        paused: false,
      })

      const paymentToken = await internalPaymentTokenRepository.save({
        contractId: "0.0.111111",
        treasuryId: treasury.id,
      })

      const response = await request(app.getHttpServer())
        .get(
          `/api/v1/treasuries/${treasury.contractId}/payment-tokens/${paymentToken.contractId}/transfers`,
        )
        .expect(200)

      expect(response.body).toHaveProperty("items")
      expect(response.body.items).toEqual([])
      expect(response.body).toHaveProperty("total")
      expect(response.body).toHaveProperty("page")
      expect(response.body).toHaveProperty("limit")
      expect(response.body).toHaveProperty("totalPages")
    })

    it("should return transfers for existing payment token", async () => {
      const treasury = await internalTreasuryRepository.save({
        contractId: "0.0.123456",
        bondContractId: "0.0.789012",
        paused: false,
      })

      const paymentToken = await internalPaymentTokenRepository.save({
        contractId: "0.0.111111",
        treasuryId: treasury.id,
      })

      const transfer1 = await internalPaymentTokenTransferRepository.save({
        accountId: "0.0.111111",
        amount: "1",
        paymentTokenId: paymentToken.id,
        type: TransferType.INFLOW,
      })

      const transfer2 = await internalPaymentTokenTransferRepository.save({
        accountId: "0.0.222222",
        amount: "2",
        paymentTokenId: paymentToken.id,
        type: TransferType.OUTFLOW,
      })

      const response = await request(app.getHttpServer())
        .get(
          `/api/v1/treasuries/${treasury.contractId}/payment-tokens/${paymentToken.contractId}/transfers`,
        )
        .expect(200)

      expect(response.body.total).toBe(2)
      expect(response.body.page).toBe(1)
      expect(response.body.limit).toBe(10)
      expect(response.body.totalPages).toBe(1)
      expect(response.body.items).toHaveLength(2)

      const item1 = response.body.items.find((item: any) => item.accountId === transfer1.accountId)
      const item2 = response.body.items.find((item: any) => item.accountId === transfer2.accountId)

      expect(item1).toEqual({
        accountId: transfer1.accountId,
        amount: transfer1.amount,
        type: transfer1.type,
        transferDate: expect.any(String),
      })

      expect(item2).toEqual({
        accountId: transfer2.accountId,
        amount: transfer2.amount,
        type: transfer2.type,
        transferDate: expect.any(String),
      })
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
      })

      for (let i = 1; i <= 5; i++) {
        await internalPaymentTokenTransferRepository.save({
          accountId: `0.0.${111110 + i}`,
          paymentTokenId: paymentToken.id,
          amount: "1",
          type: i % 2 === 0 ? TransferType.INFLOW : TransferType.OUTFLOW,
        })
      }

      const response = await request(app.getHttpServer())
        .get(
          `/api/v1/treasuries/${treasury.contractId}/payment-tokens/${paymentToken.contractId}/transfers`,
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
        contractId: "0.0.111111",
        treasuryId: treasury.id,
      })

      const transfer1 = await internalPaymentTokenTransferRepository.save({
        accountId: "0.0.111111",
        paymentTokenId: paymentToken.id,
        amount: "1",
        type: TransferType.INFLOW,
      })

      await new Promise((resolve) => setTimeout(resolve, 10))

      const transfer2 = await internalPaymentTokenTransferRepository.save({
        accountId: "0.0.222222",
        paymentTokenId: paymentToken.id,
        amount: "1",
        type: TransferType.OUTFLOW,
      })

      const response = await request(app.getHttpServer())
        .get(
          `/api/v1/treasuries/${treasury.contractId}/payment-tokens/${paymentToken.contractId}/transfers`,
        )
        .query({ orderBy: "createdAt", order: "ASC" })
        .expect(200)

      expect(response.body.items).toHaveLength(2)
      expect(response.body.items[0].accountId).toBe(transfer1.accountId)
      expect(response.body.items[1].accountId).toBe(transfer2.accountId)
    })

    it("should return 404 when environmental asset does not exist", async () => {
      const treasury = await internalTreasuryRepository.save({
        contractId: "0.0.123456",
        bondContractId: "0.0.789012",
        paused: false,
      })
      const nonExistentPaymentTokenId = "0.0.999999"

      await request(app.getHttpServer())
        .get(`/api/v1/treasuries/${treasury.contractId}/payment-tokens/${nonExistentPaymentTokenId}/transfers`)
        .expect(404)
    })

    it("should filter transfers by environmental asset", async () => {
      const treasury = await internalTreasuryRepository.save({
        contractId: "0.0.123456",
        bondContractId: "0.0.789012",
        paused: false,
      })

      const paymentToken1 = await internalPaymentTokenRepository.save({
        contractId: "0.0.111111",
        treasuryId: treasury.id,
      })

      const paymentToken2 = await internalPaymentTokenRepository.save({
        contractId: "0.0.222222",
        treasuryId: treasury.id,
      })

      await internalPaymentTokenTransferRepository.save({
        accountId: "0.0.111111",
        paymentTokenId: paymentToken1.id,
        amount: "1",
        type: TransferType.INFLOW,
      })

      await internalPaymentTokenTransferRepository.save({
        accountId: "0.0.222222",
        paymentTokenId: paymentToken2.id,
        amount: "2",
        type: TransferType.OUTFLOW,
      })

      const response = await request(app.getHttpServer())
        .get(
          `/api/v1/treasuries/${treasury.contractId}/payment-tokens/${paymentToken1.contractId}/transfers`
        )
        .expect(200)

      expect(response.body.total).toBe(1)
      expect(response.body.items).toHaveLength(1)
      expect(response.body.items[0].accountId).toBe("0.0.111111")
    })

    it("should return transfers with correct types", async () => {
      const treasury = await internalTreasuryRepository.save({
        contractId: "0.0.123456",
        bondContractId: "0.0.789012",
        paused: false,
      })

      const paymentToken = await internalPaymentTokenRepository.save({
        contractId: "0.0.111111",
        treasuryId: treasury.id,
      })

      await internalPaymentTokenTransferRepository.save({
        accountId: "0.0.111111",
        paymentTokenId: paymentToken.id,
        amount: "1",
        type: TransferType.INFLOW,
      })

      await internalPaymentTokenTransferRepository.save({
        accountId: "0.0.222222",
        paymentTokenId: paymentToken.id,
        amount: "2",
        type: TransferType.OUTFLOW,
      })

      const response = await request(app.getHttpServer())
        .get(
          `/api/v1/treasuries/${treasury.contractId}/payment-tokens/${paymentToken.contractId}/transfers`
        )
        .expect(200)

      expect(response.body.items).toHaveLength(2)

      const inflowTransfer = response.body.items.find((item: any) => item.type === TransferType.INFLOW)
      const outflowTransfer = response.body.items.find((item: any) => item.type === TransferType.OUTFLOW)

      expect(inflowTransfer).toBeDefined()
      expect(inflowTransfer.accountId).toBe("0.0.111111")
      expect(inflowTransfer.amount).toBe("1")

      expect(outflowTransfer).toBeDefined()
      expect(outflowTransfer.accountId).toBe("0.0.222222")
      expect(outflowTransfer.amount).toBe("2")
    })

    it("should filter transfers by type=OUTFLOW query param", async () => {
      const treasury = await internalTreasuryRepository.save({
        contractId: "0.0.123456",
        bondContractId: "0.0.789012",
        paused: false,
      })

      const paymentToken = await internalPaymentTokenRepository.save({
        contractId: "0.0.111111",
        treasuryId: treasury.id,
      })

      await internalPaymentTokenTransferRepository.save({
        accountId: "0.0.111111",
        paymentTokenId: paymentToken.id,
        amount: "1",
        type: TransferType.INFLOW,
      })

      await internalPaymentTokenTransferRepository.save({
        accountId: "0.0.222222",
        paymentTokenId: paymentToken.id,
        amount: "2",
        type: TransferType.OUTFLOW,
      })

      const response = await request(app.getHttpServer())
        .get(
          `/api/v1/treasuries/${treasury.contractId}/payment-tokens/${paymentToken.contractId}/transfers`
        )
        .query({ type: TransferType.OUTFLOW })
        .expect(200)

      expect(response.body.items).toHaveLength(1)
      expect(response.body.items[0].type).toBe(TransferType.OUTFLOW)
      expect(response.body.items[0].accountId).toBe("0.0.222222")
      expect(response.body.items[0].amount).toBe("2")
    })

    it.skip("should return all transfers when type is not provided", async () => {
      const treasury = await internalTreasuryRepository.save({
        contractId: "0.0.123456",
        bondContractId: "0.0.789012",
        paused: false,
      })

      const paymentToken = await internalPaymentTokenRepository.save({
        contractId: "0.0.111111",
        treasuryId: treasury.id,
      })

      await internalPaymentTokenTransferRepository.save({
        accountId: "0.0.111111",
        paymentTokenId: paymentToken.id,
        amount: "1",
        type: TransferType.INFLOW,
      })

      await internalPaymentTokenTransferRepository.save({
        accountId: "0.0.222222",
        paymentTokenId: paymentToken.id,
        amount: "2",
        type: TransferType.OUTFLOW,
      })

      const response = await request(app.getHttpServer())
        .get(
          `/api/v1/treasuries/${treasury.contractId}/payment-tokens/${paymentToken.contractId}/transfers`
        )
        .expect(200)

      expect(response.body.items).toHaveLength(2)
      const types = response.body.items.map((i: any) => i.type).sort()
      expect(types).toEqual([TransferType.INFLOW, TransferType.OUTFLOW].sort())
    })
  })
})
