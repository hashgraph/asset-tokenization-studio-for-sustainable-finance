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
import { EnvironmentalAssetTokenPersistence } from "@port/persistence/environmentalasset/model/EnvironmentalAssetTokenPersistence"
import { TreasuryNotFoundError } from "@domain/treasury/errors/TreasuryNotFoundError"
import { EnvironmentalAssetNotFoundError } from "@domain/environmentalasset/errors/EnvironmentalAssetNotFoundError"

describe("GetEnvironmentalAssetHoldings API Integration", () => {
  let app: INestApplication
  let internalTreasuryRepository: Repository<TreasuryPersistence>
  let environmentalAssetRepository: Repository<EnvironmentalAssetPersistence>
  let environmentalAssetTokenRepository: Repository<EnvironmentalAssetTokenPersistence>
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SharedModule, PostgresModule.forRoot(PostgreSqlContainer.getWorkerConfig())],
      controllers: CONTROLLERS,
      providers: PROVIDERS,
    }).compile()

    app = moduleFixture.createNestApplication()
    app.setGlobalPrefix("api/v1")
    await app.init()

    internalTreasuryRepository = moduleFixture.get<Repository<TreasuryPersistence>>(
      getRepositoryToken(TreasuryPersistence),
    )
    environmentalAssetRepository = moduleFixture.get<Repository<EnvironmentalAssetPersistence>>(
      getRepositoryToken(EnvironmentalAssetPersistence),
    )
    environmentalAssetTokenRepository = moduleFixture.get<Repository<EnvironmentalAssetTokenPersistence>>(
      getRepositoryToken(EnvironmentalAssetTokenPersistence),
    )
  })
  afterEach(async () => {
    await environmentalAssetTokenRepository.deleteAll()
    await environmentalAssetRepository.deleteAll()
    await internalTreasuryRepository.deleteAll()
    if (app) {
      await app.close()
    }
  })

  describe("GET /treasuries/:treasuryContractId/environmental-assets/:environmentalAssetContractId/holdings", () => {
    it("should return empty list when environmental asset has no holdings", async () => {
      const treasury = await internalTreasuryRepository.save({
        contractId: "0.0.123456",
        bondContractId: "0.0.789012",
        paused: false,
      })

      const environmentalAsset = await environmentalAssetRepository.save({
        contractId: "0.0.7777",
        treasuryId: treasury.id,
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/treasuries/${treasury.contractId}/environmental-assets/${environmentalAsset.contractId}/holdings`)
        .expect(200)

      expect(response.body).toHaveProperty("items")
      expect(response.body.items).toEqual([])
      expect(response.body).toHaveProperty("total")
      expect(response.body).toHaveProperty("page")
      expect(response.body).toHaveProperty("limit")
      expect(response.body).toHaveProperty("totalPages")
    })

    it("should return holdings for existing environmental asset", async () => {
      const treasury = await internalTreasuryRepository.save({
        contractId: "0.0.123456",
        bondContractId: "0.0.789012",
        paused: false,
      })

      const environmentalAsset = await environmentalAssetRepository.save({
        contractId: "0.0.7777",
        treasuryId: treasury.id,
      })

      const token1 = await environmentalAssetTokenRepository.save({
        environmentalAssetId: environmentalAsset.id,
        tokenId: 1,
      })

      const token2 = await environmentalAssetTokenRepository.save({
        environmentalAssetId: environmentalAsset.id,
        tokenId: 2,
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/treasuries/${treasury.contractId}/environmental-assets/${environmentalAsset.contractId}/holdings`)
        .expect(200)

      expect(response.body.items).toHaveLength(2)

      const sortedItems = response.body.items.sort((a: any, b: any) => a.tokenId - b.tokenId)

      expect(sortedItems[0]).toEqual({
        tokenId: 1,
        additionDate: token1.createdAt.toISOString(),
      })
      expect(sortedItems[1]).toEqual({
        tokenId: 2,
        additionDate: token2.createdAt.toISOString(),
      })

      expect(response.body.total).toBe(2)
      expect(response.body.page).toBe(1)
      expect(response.body.limit).toBe(10)
      expect(response.body.totalPages).toBe(1)
    })

    it("should handle pagination parameters correctly", async () => {
      const treasury = await internalTreasuryRepository.save({
        contractId: "0.0.123456",
        bondContractId: "0.0.789012",
        paused: false,
      })

      const environmentalAsset = await environmentalAssetRepository.save({
        contractId: "0.0.7777",
        treasuryId: treasury.id,
      })

      const createdTokens: EnvironmentalAssetTokenPersistence[] = []
      const baseTime = new Date("2025-01-01T00:00:00.000Z")
      for (let i = 1; i <= 5; i++) {
        const token = await environmentalAssetTokenRepository.save({
          environmentalAssetId: environmentalAsset.id,
          tokenId: i,
          createdAt: new Date(baseTime.getTime() + i * 1000), // Ensure unique timestamps
        })
        createdTokens.push(token)
      }

      const response = await request(app.getHttpServer())
        .get(
          `/api/v1/treasuries/${treasury.contractId}/environmental-assets/${environmentalAsset.contractId}/holdings` +
            `?page=2&limit=2`,
        )
        .expect(200)

      expect(response.body.total).toBe(5)
      expect(response.body.page).toBe(2)
      expect(response.body.limit).toBe(2)
      expect(response.body.totalPages).toBe(3)
      expect(response.body.items).toHaveLength(2)

      const sortedTokensByCreatedAt = createdTokens.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )

      const expectedToken1 = sortedTokensByCreatedAt[2]
      const expectedToken2 = sortedTokensByCreatedAt[3]

      const sortedResponseItems = response.body.items.sort((a: any, b: any) => a.tokenId - b.tokenId)
      const expectedItems = [expectedToken1, expectedToken2].sort((a, b) => a.tokenId - b.tokenId)

      expect(sortedResponseItems[0]).toEqual({
        tokenId: expectedItems[0].tokenId,
        additionDate: expectedItems[0].createdAt.toISOString(),
      })
      expect(sortedResponseItems[1]).toEqual({
        tokenId: expectedItems[1].tokenId,
        additionDate: expectedItems[1].createdAt.toISOString(),
      })
    })

    it("should return 404 when treasury does not exist", async () => {
      const nonExistentTreasuryId = "0.0.999999"
      const assetContractId = "0.0.111111"
      const errorMessage = TreasuryNotFoundError.contractIdError(nonExistentTreasuryId).message

      const response = await request(app.getHttpServer())
        .get(`/api/v1/treasuries/${nonExistentTreasuryId}/environmental-assets/${assetContractId}/holdings`)
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
        .get(`/api/v1/treasuries/${treasury.contractId}/environmental-assets/${nonExistentAssetId}/holdings`)
        .expect(HttpStatus.NOT_FOUND)

      expect(response.body).toEqual({
        cause: errorMessage,
        message: errorMessage,
        statusCode: HttpStatus.NOT_FOUND,
      })
    })

    it("should handle ordering parameters correctly", async () => {
      const treasury = await internalTreasuryRepository.save({
        contractId: "0.0.123456",
        bondContractId: "0.0.789012",
        paused: false,
      })

      const environmentalAsset = await environmentalAssetRepository.save({
        contractId: "0.0.7777",
        treasuryId: treasury.id,
      })

      await environmentalAssetTokenRepository.save({
        environmentalAssetId: environmentalAsset.id,
        tokenId: 1,
      })

      await new Promise((resolve) => setTimeout(resolve, 10))

      await environmentalAssetTokenRepository.save({
        environmentalAssetId: environmentalAsset.id,
        tokenId: 2,
      })

      await new Promise((resolve) => setTimeout(resolve, 10))

      await environmentalAssetTokenRepository.save({
        environmentalAssetId: environmentalAsset.id,
        tokenId: 3,
      })

      const response = await request(app.getHttpServer())
        .get(
          `/api/v1/treasuries/${treasury.contractId}/environmental-assets/${environmentalAsset.contractId}/holdings` +
            `?orderBy=createdAt&order=desc`,
        )
        .expect(200)

      expect(response.body.items).toHaveLength(3)
      expect(response.body.items[0].tokenId).toBe(3)
      expect(response.body.items[1].tokenId).toBe(2)
      expect(response.body.items[2].tokenId).toBe(1)
    })
  })
})
