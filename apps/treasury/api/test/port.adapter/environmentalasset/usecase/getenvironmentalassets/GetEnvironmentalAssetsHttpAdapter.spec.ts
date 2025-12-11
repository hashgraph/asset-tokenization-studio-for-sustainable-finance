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
import { EnvironmentalAssetPersistence } from "@port/persistence/environmentalasset/model/EnvironmentalAssetPersistence"

describe("GetEnvironmentalAssets API Integration", () => {
  let app: INestApplication
  let internalTreasuryRepository: Repository<TreasuryPersistence>
  let environmentalAssetRepository: Repository<EnvironmentalAssetPersistence>
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
  })
  afterEach(async () => {
    await environmentalAssetRepository.deleteAll()
    await internalTreasuryRepository.deleteAll()
    if (app) {
      await app.close()
    }
  })

  describe("GET /treasuries/:treasuryContractId/environmental-assets", () => {
    it("should return empty list when treasury has no environmental assets", async () => {
      const treasury = await internalTreasuryRepository.save({
        contractId: "0.0.123456",
        bondContractId: "0.0.789012",
        paused: false,
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/treasuries/${treasury.contractId}/environmental-assets`)
        .expect(200)

      expect(response.body).toHaveProperty("items")
      expect(response.body.items).toEqual([])
      expect(response.body).toHaveProperty("total")
      expect(response.body).toHaveProperty("page")
      expect(response.body).toHaveProperty("limit")
      expect(response.body).toHaveProperty("totalPages")
    })

    it("should return environmental assets for existing treasury", async () => {
      const treasury = await internalTreasuryRepository.save({
        contractId: "0.0.123456",
        bondContractId: "0.0.789012",
        paused: false,
      })

      const asset1 = await environmentalAssetRepository.save({
        contractId: "0.0.111111",
        treasuryId: treasury.id,
      })

      const asset2 = await environmentalAssetRepository.save({
        contractId: "0.0.222222",
        treasuryId: treasury.id,
        dissociationError: 777,
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/treasuries/${treasury.contractId}/environmental-assets`)
        .expect(200)

      expect(response.body.total).toBe(2)
      expect(response.body.page).toBe(1)
      expect(response.body.limit).toBe(10)
      expect(response.body.totalPages).toBe(1)
      expect(response.body.items).toHaveLength(2)

      const contractIds = response.body.items.map((item: any) => item.contractId)
      expect(contractIds).toContain(asset1.contractId)
      expect(contractIds).toContain(asset2.contractId)

      response.body.items.forEach((item: any) => {
        expect(item).toHaveProperty("contractId")
        expect(item).toHaveProperty("additionDate")
        expect(item).toHaveProperty("removalDate")
        expect(item.removalDate).toBeNull()
      })
      expect(response.body.items.find((item) => item.contractId === asset1.contractId).dissociationError).toBeNull()
      expect(response.body.items.find((item) => item.contractId === asset2.contractId).dissociationError).toEqual(
        asset2.dissociationError,
      )
    })

    it("should handle pagination parameters", async () => {
      const treasury = await internalTreasuryRepository.save({
        contractId: "0.0.123456",
        bondContractId: "0.0.789012",
        paused: false,
      })

      for (let i = 1; i <= 5; i++) {
        await environmentalAssetRepository.save({
          contractId: `0.0.${111110 + i}`,
          treasuryId: treasury.id,
        })
      }

      const response = await request(app.getHttpServer())
        .get(`/api/v1/treasuries/${treasury.contractId}/environmental-assets`)
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

      const asset1 = await environmentalAssetRepository.save({
        contractId: "0.0.111111",
        treasuryId: treasury.id,
      })

      await new Promise((resolve) => setTimeout(resolve, 10))

      const asset2 = await environmentalAssetRepository.save({
        contractId: "0.0.222222",
        treasuryId: treasury.id,
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/treasuries/${treasury.contractId}/environmental-assets`)
        .query({ orderBy: "createdAt", order: "ASC" })
        .expect(200)

      expect(response.body.items).toHaveLength(2)
      expect(response.body.items[0].contractId).toBe(asset1.contractId)
      expect(response.body.items[1].contractId).toBe(asset2.contractId)
    })

    it("should return 404 when treasury does not exist", async () => {
      const nonExistentTreasuryId = "0.0.999999"

      await request(app.getHttpServer())
        .get(`/api/v1/treasuries/${nonExistentTreasuryId}/environmental-assets`)
        .expect(404)
    })
  })
})
