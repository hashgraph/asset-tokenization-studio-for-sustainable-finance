// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { HttpStatus, INestApplication } from "@nestjs/common"
import request from "supertest"
import { Repository } from "typeorm"
import { getRepositoryToken } from "@nestjs/typeorm"
import { CONTROLLERS, PROVIDERS } from "../../../../../src/Components"
import { SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "../../../../shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"
import { TreasuryPersistence } from "@port/persistence/treasury/model/TreasuryPersistence"
import { EnvironmentalAssetPersistence } from "@port/persistence/environmentalasset/model/EnvironmentalAssetPersistence"
import { HederaPort } from "@port/blockchain/HederaPort"
import { TreasuryNotFoundError } from "@domain/treasury/errors/TreasuryNotFoundError"
import { EnvironmentalAssetNotFoundError } from "@domain/environmentalasset/errors/EnvironmentalAssetNotFoundError"

describe("GetEnvironmentalAssetHoldings API Integration", () => {
  let app: INestApplication
  let container: PostgreSqlContainer
  let internalTreasuryRepository: Repository<TreasuryPersistence>
  let environmentalAssetRepository: Repository<EnvironmentalAssetPersistence>
  let hederaPort: HederaPort

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
    app.setGlobalPrefix("api/treasuries")
    await app.init()

    internalTreasuryRepository = moduleFixture.get<Repository<TreasuryPersistence>>(
      getRepositoryToken(TreasuryPersistence),
    )
    environmentalAssetRepository = moduleFixture.get<Repository<EnvironmentalAssetPersistence>>(
      getRepositoryToken(EnvironmentalAssetPersistence),
    )
    hederaPort = app.get("HederaPort")
  })

  afterAll(async () => {
    await container.stop()
  })

  afterEach(async () => {
    await environmentalAssetRepository.deleteAll()
    await internalTreasuryRepository.deleteAll()
    if (app) {
      await app.close()
    }
  })

  describe("GET /:treasuryContractId/environmental-assets/:assetContractId/holdings", () => {
    it("should return empty list when asset has no holdings", async () => {
      const treasury = await internalTreasuryRepository.save({
        contractId: "0.0.123456",
        bondContractId: "0.0.789012",
        paused: false,
      })

      const asset = await environmentalAssetRepository.save({
        contractId: "0.0.111111",
        treasuryId: treasury.id,
      })

      // Mock empty holdings from Hedera mirror
      jest.spyOn(hederaPort, "getNFTs").mockResolvedValue({
        items: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      })

      const response = await request(app.getHttpServer())
        .get(`/api/treasuries/${treasury.contractId}/environmental-assets/${asset.contractId}/holdings`)
        .expect(HttpStatus.OK)

      expect(response.body).toHaveProperty("items")
      expect(response.body.items).toEqual([])
      expect(response.body).toHaveProperty("total", 0)
      expect(response.body).toHaveProperty("page", 1)
      expect(response.body).toHaveProperty("limit", 10)
      expect(response.body).toHaveProperty("totalPages", 0)
    })

    it("should return holdings for existing asset", async () => {
      const treasury = await internalTreasuryRepository.save({
        contractId: "0.0.123456",
        bondContractId: "0.0.789012",
        paused: false,
      })

      const asset = await environmentalAssetRepository.save({
        contractId: "0.0.111111",
        treasuryId: treasury.id,
      })

      const mockHoldings = {
        items: [
          {
            created_timestamp: "2024-01-15T10:30:00.000Z",
            delegating_spender: null,
            deleted: false,
            metadata: "QmTestHash1",
            modified_timestamp: "2024-01-15T10:30:00.000Z",
            serial_number: 1,
            spender_id: "0.0.555555",
          },
          {
            created_timestamp: "2024-01-15T11:30:00.000Z",
            delegating_spender: "0.0.666666",
            deleted: false,
            metadata: "QmTestHash2",
            modified_timestamp: "2024-01-15T11:30:00.000Z",
            serial_number: 2,
            spender_id: null,
          },
        ],
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      }

      // Mock holdings from Hedera mirror
      jest.spyOn(hederaPort, "getNFTs").mockResolvedValue(mockHoldings)

      const response = await request(app.getHttpServer())
        .get(`/api/treasuries/${treasury.contractId}/environmental-assets/${asset.contractId}/holdings`)
        .expect(HttpStatus.OK)

      expect(response.body.total).toBe(2)
      expect(response.body.page).toBe(1)
      expect(response.body.limit).toBe(10)
      expect(response.body.totalPages).toBe(1)
      expect(response.body.items).toHaveLength(2)

      // Verify first holding
      expect(response.body.items[0]).toEqual({
        createdTimestamp: "2024-01-15T10:30:00.000Z",
        delegatingSpender: null,
        deleted: false,
        metadata: "QmTestHash1",
        modifiedTimestamp: "2024-01-15T10:30:00.000Z",
        serialNumber: 1,
        spenderId: "0.0.555555",
      })

      // Verify second holding
      expect(response.body.items[1]).toEqual({
        createdTimestamp: "2024-01-15T11:30:00.000Z",
        delegatingSpender: "0.0.666666",
        deleted: false,
        metadata: "QmTestHash2",
        modifiedTimestamp: "2024-01-15T11:30:00.000Z",
        serialNumber: 2,
        spenderId: null,
      })
    })

    it("should handle pagination parameters", async () => {
      const treasury = await internalTreasuryRepository.save({
        contractId: "0.0.123456",
        bondContractId: "0.0.789012",
        paused: false,
      })

      const asset = await environmentalAssetRepository.save({
        contractId: "0.0.111111",
        treasuryId: treasury.id,
      })

      const mockHoldings = {
        items: [
          {
            createdTimestamp: "2024-01-15T10:30:00.000Z",
            delegatingSpender: null,
            deleted: false,
            metadata: "QmTestHash1",
            modifiedTimestamp: "2024-01-15T10:30:00.000Z",
            serialNumber: 1,
            spenderId: "0.0.555555",
          },
          {
            createdTimestamp: "2024-01-15T11:00:00.000Z",
            delegatingSpender: null,
            deleted: false,
            metadata: "QmTestHash2",
            modifiedTimestamp: "2024-01-15T11:00:00.000Z",
            serialNumber: 2,
            spenderId: "0.0.666666",
          },
          {
            createdTimestamp: "2024-01-15T12:00:00.000Z",
            delegatingSpender: null,
            deleted: false,
            metadata: "QmTestHash3",
            modifiedTimestamp: "2024-01-15T12:00:00.000Z",
            serialNumber: 3,
            spenderId: "0.0.777777",
          },
        ],
        total: 5,
        page: 1,
        limit: 3,
        totalPages: 2,
      }

      jest.spyOn(hederaPort, "getNFTs").mockResolvedValue(mockHoldings)

      const response = await request(app.getHttpServer())
        .get(`/api/treasuries/${treasury.contractId}/environmental-assets/${asset.contractId}/holdings`)
        .query({ page: 1, limit: 3 })
        .expect(HttpStatus.OK)

      expect(response.body.total).toBe(5)
      expect(response.body.page).toBe(1)
      expect(response.body.limit).toBe(3)
      expect(response.body.totalPages).toBe(2)
      expect(response.body.items).toHaveLength(3)
    })

    it("should return 404 when treasury does not exist", async () => {
      const nonExistentTreasuryId = "0.0.999999"
      const assetContractId = "0.0.111111"
      const errorMessage = TreasuryNotFoundError.contractIdError(nonExistentTreasuryId).message

      const response = await request(app.getHttpServer())
        .get(`/api/treasuries/${nonExistentTreasuryId}/environmental-assets/${assetContractId}/holdings`)
        .expect(HttpStatus.NOT_FOUND)

      expect(response.body).toEqual({
        cause: errorMessage,
        message: errorMessage,
        statusCode: HttpStatus.NOT_FOUND,
      })
    })

    it("should return 404 when environmental asset does not exist", async () => {
      const treasury = await internalTreasuryRepository.save({
        contractId: "0.0.123456",
        bondContractId: "0.0.789012",
        paused: false,
      })

      const nonExistentAssetId = "0.0.999999"
      const errorMessage = EnvironmentalAssetNotFoundError.idError(nonExistentAssetId).message

      const response = await request(app.getHttpServer())
        .get(`/api/treasuries/${treasury.contractId}/environmental-assets/${nonExistentAssetId}/holdings`)
        .expect(HttpStatus.NOT_FOUND)

      expect(response.body).toEqual({
        cause: errorMessage,
        message: errorMessage,
        statusCode: HttpStatus.NOT_FOUND,
      })
    })

    it("should handle ordering parameters", async () => {
      const treasury = await internalTreasuryRepository.save({
        contractId: "0.0.123456",
        bondContractId: "0.0.789012",
        paused: false,
      })

      const asset = await environmentalAssetRepository.save({
        contractId: "0.0.111111",
        treasuryId: treasury.id,
      })

      const mockHoldings = {
        items: [
          {
            created_timestamp: "2024-01-15T09:00:00.000Z",
            delegating_spender: null,
            deleted: false,
            metadata: "QmTestHash1",
            modified_timestamp: "2024-01-15T09:00:00.000Z",
            serial_number: 1,
            spender_id: "0.0.555555",
          },
          {
            created_timestamp: "2024-01-15T10:00:00.000Z",
            delegating_spender: null,
            deleted: false,
            metadata: "QmTestHash2",
            modified_timestamp: "2024-01-15T10:00:00.000Z",
            serial_number: 2,
            spender_id: "0.0.666666",
          },
        ],
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      }

      jest.spyOn(hederaPort, "getNFTs").mockResolvedValue(mockHoldings)

      const response = await request(app.getHttpServer())
        .get(`/api/treasuries/${treasury.contractId}/environmental-assets/${asset.contractId}/holdings`)
        .query({ orderBy: "createdTimestamp", order: "ASC" })
        .expect(HttpStatus.OK)

      expect(response.body.items).toHaveLength(2)
      expect(response.body.items[0].serialNumber).toBe(1)
      expect(response.body.items[1].serialNumber).toBe(2)
    })
  })
})
