// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import request from "supertest"
import { CONTROLLERS, PROVIDERS } from "../../../../../src/Components"
import { ConverterUtils, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "../../../../shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"
import { TransactionBuilderAdapter } from "@port/transactionbuilder/TransactionBuilderAdapter"
import { Repository } from "typeorm"
import { TreasuryPersistence } from "@port/persistence/treasury/model/TreasuryPersistence"
import { getRepositoryToken } from "@nestjs/typeorm"
import { TreasuryNotFoundError } from "@domain/treasury/errors/TreasuryNotFoundError"

describe("ExecuteRedemptionTransaction API Integration", () => {
  let app: INestApplication
  let internalTreasuryRepository: Repository<TreasuryPersistence>
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SharedModule, PostgresModule.forRoot(PostgreSqlContainer.getWorkerConfig())],
      controllers: CONTROLLERS,
      providers: PROVIDERS,
    }).compile()

    app = moduleFixture.createNestApplication()
    app.setGlobalPrefix("api/v1")
    await app.init()
    internalTreasuryRepository = app.get(getRepositoryToken(TreasuryPersistence))
    jest
      .spyOn(ConverterUtils, "getEvmAddressFromHederaAddress")
      .mockResolvedValue("0x1dC69e700e3fF1Cd7ca407DcCC6f8061D260F1E7")
    delete process.env.MAX_BATCH_SIZE
  })
  afterEach(async () => {
    await internalTreasuryRepository.deleteAll()
  })

  describe("POST /treasuries/:treasuryContractId/redemptions", () => {
    it("should return redemption execution transactions in hedera format paginated", async () => {
      const treasury = await internalTreasuryRepository.save({
        contractId: "0.0.6625592",
        bondContractId: "0.0.6974684",
        paused: false,
      })
      const redemptionRequest = {
        format: "hedera",
        accountId: "0.0.123456789",
        maxBatchSize: 5,
      }

      jest.spyOn(TransactionBuilderAdapter.prototype as any, "getTotalBondHolders").mockResolvedValue(130)

      let response = await request(app.getHttpServer())
        .post(`/api/v1/treasuries/${treasury.contractId}/redemptions`)
        .query({ page: 1, limit: 10 })
        .send(redemptionRequest)
        .expect(201)

      expect(response.body).toEqual({
        items: expect.any(Array),
        total: 26,
        page: 1,
        limit: 10,
        totalPages: 3,
      })
      expect(response.body.items).toHaveLength(10)

      response = await request(app.getHttpServer())
        .post(`/api/v1/treasuries/${treasury.contractId}/redemptions`)
        .query({ page: 2, limit: 10 })
        .send(redemptionRequest)
        .expect(201)

      expect(response.body).toEqual({
        items: expect.any(Array),
        total: 26,
        page: 2,
        limit: 10,
        totalPages: 3,
      })
      expect(response.body.items).toHaveLength(10)

      response = await request(app.getHttpServer())
        .post(`/api/v1/treasuries/${treasury.contractId}/redemptions`)
        .query({ page: 3, limit: 10 })
        .send(redemptionRequest)
        .expect(201)

      expect(response.body).toEqual({
        items: expect.any(Array),
        total: 26,
        page: 3,
        limit: 10,
        totalPages: 3,
      })
      expect(response.body.items).toHaveLength(6)
    })

    it("should return redemption execution transactions in ethereum format paginated", async () => {
      const treasury = await internalTreasuryRepository.save({
        contractId: "0.0.6625592",
        bondContractId: "0.0.6974684",
        paused: false,
      })
      const redemptionRequest = {
        format: "ethereum",
        accountId: "0.0.123456789",
        maxBatchSize: 5,
      }

      jest.spyOn(TransactionBuilderAdapter.prototype as any, "getTotalBondHolders").mockResolvedValue(130)

      let response = await request(app.getHttpServer())
        .post(`/api/v1/treasuries/${treasury.contractId}/redemptions`)
        .query({ page: 1, limit: 10 })
        .send(redemptionRequest)
        .expect(201)

      expect(response.body).toEqual({
        items: expect.any(Array),
        total: 26,
        page: 1,
        limit: 10,
        totalPages: 3,
      })
      expect(response.body.items).toHaveLength(10)

      response = await request(app.getHttpServer())
        .post(`/api/v1/treasuries/${treasury.contractId}/redemptions`)
        .query({ page: 2, limit: 10 })
        .send(redemptionRequest)
        .expect(201)

      expect(response.body).toEqual({
        items: expect.any(Array),
        total: 26,
        page: 2,
        limit: 10,
        totalPages: 3,
      })
      expect(response.body.items).toHaveLength(10)

      response = await request(app.getHttpServer())
        .post(`/api/v1/treasuries/${treasury.contractId}/redemptions`)
        .query({ page: 3, limit: 10 })
        .send(redemptionRequest)
        .expect(201)

      expect(response.body).toEqual({
        items: expect.any(Array),
        total: 26,
        page: 3,
        limit: 10,
        totalPages: 3,
      })
      expect(response.body.items).toHaveLength(6)
    })

    it("should return redemption execution transactions using configured max batch size", async () => {
      const treasury = await internalTreasuryRepository.save({
        contractId: "0.0.6625592",
        bondContractId: "0.0.6974684",
        paused: false,
      })
      const redemptionRequest = {
        format: "hedera",
        accountId: "0.0.123456789",
      }
      process.env.MAX_BATCH_SIZE = 5

      jest.spyOn(TransactionBuilderAdapter.prototype as any, "getTotalBondHolders").mockResolvedValue(130)

      let response = await request(app.getHttpServer())
        .post(`/api/v1/treasuries/${treasury.contractId}/redemptions`)
        .query({ page: 1, limit: 10 })
        .send(redemptionRequest)
        .expect(201)

      expect(response.body).toEqual({
        items: expect.any(Array),
        total: 26,
        page: 1,
        limit: 10,
        totalPages: 3,
      })
      expect(response.body.items).toHaveLength(10)

      response = await request(app.getHttpServer())
        .post(`/api/v1/treasuries/${treasury.contractId}/redemptions`)
        .query({ page: 2, limit: 10 })
        .send(redemptionRequest)
        .expect(201)

      expect(response.body).toEqual({
        items: expect.any(Array),
        total: 26,
        page: 2,
        limit: 10,
        totalPages: 3,
      })
      expect(response.body.items).toHaveLength(10)

      response = await request(app.getHttpServer())
        .post(`/api/v1/treasuries/${treasury.contractId}/redemptions`)
        .query({ page: 3, limit: 10 })
        .send(redemptionRequest)
        .expect(201)

      expect(response.body).toEqual({
        items: expect.any(Array),
        total: 26,
        page: 3,
        limit: 10,
        totalPages: 3,
      })
      expect(response.body.items).toHaveLength(6)
    })

    it("should return empty page if page does not exist", async () => {
      const treasury = await internalTreasuryRepository.save({
        contractId: "0.0.6625592",
        bondContractId: "0.0.6974684",
        paused: false,
      })
      const redemptionRequest = {
        format: "hedera",
        accountId: "0.0.123456789",
        maxBatchSize: 5,
      }

      jest.spyOn(TransactionBuilderAdapter.prototype as any, "getTotalBondHolders").mockResolvedValue(130)

      const response = await request(app.getHttpServer())
        .post(`/api/v1/treasuries/${treasury.contractId}/redemptions`)
        .query({ page: 4, limit: 10 })
        .send(redemptionRequest)
        .expect(201)

      expect(response.body).toEqual({
        items: [],
        total: 26,
        page: 4,
        limit: 10,
        totalPages: 3,
      })
    })

    it("should throw error if treasury does not exist", async () => {
      const treasuryContractId = "0.0.6625592"
      const redemptionRequest = {
        format: "hedera",
        accountId: "0.0.123456789",
        maxBatchSize: 5,
      }
      const errorMessage = TreasuryNotFoundError.contractIdError(treasuryContractId).message

      const response = await request(app.getHttpServer())
        .post(`/api/v1/treasuries/${treasuryContractId}/redemptions`)
        .query({ page: 1, limit: 10 })
        .send(redemptionRequest)
        .expect(404)

      expect(response.body).toEqual({
        cause: errorMessage,
        message: errorMessage,
        statusCode: 404,
      })
    })
  })
})
