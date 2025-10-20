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
import { EnvironmentalAssetTransferPersistence } from "@port/persistence/environmentalasset/model/EnvironmentalAssetTransferPersistence"
import { TransferType } from "@domain/shared/model/TransferType"

describe("GetEnvironmentalAssetTransfers API Integration", () => {
  let app: INestApplication
  let container: PostgreSqlContainer
  let internalTreasuryRepository: Repository<TreasuryPersistence>
  let internalEnvironmentalAssetRepository: Repository<EnvironmentalAssetPersistence>
  let internalEnvironmentalAssetTransferRepository: Repository<EnvironmentalAssetTransferPersistence>

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
    internalEnvironmentalAssetRepository = moduleFixture.get<Repository<EnvironmentalAssetPersistence>>(
      getRepositoryToken(EnvironmentalAssetPersistence),
    )
    internalEnvironmentalAssetTransferRepository = moduleFixture.get<Repository<EnvironmentalAssetTransferPersistence>>(
      getRepositoryToken(EnvironmentalAssetTransferPersistence),
    )
  })

  afterAll(async () => {
    await container.stop()
  })

  afterEach(async () => {
    await internalEnvironmentalAssetTransferRepository.deleteAll()
    await internalEnvironmentalAssetRepository.deleteAll()
    await internalTreasuryRepository.deleteAll()
    if (app) {
      await app.close()
    }
  })

  describe("GET /:treasuryContractId/environmental-assets/:environmentalAssetContractId/transfers", () => {
    it("should return empty list when environmental asset has no transfers", async () => {
      const treasury = await internalTreasuryRepository.save({
        contractId: "0.0.123456",
        bondContractId: "0.0.789012",
        paused: false,
      })

      const environmentalAsset = await internalEnvironmentalAssetRepository.save({
        contractId: "0.0.111111",
        treasuryId: treasury.id,
      })

      const response = await request(app.getHttpServer())
        .get(`/api/treasuries/${treasury.contractId}/environmental-assets/${environmentalAsset.contractId}/transfers`)
        .expect(200)

      expect(response.body).toHaveProperty("items")
      expect(response.body.items).toEqual([])
      expect(response.body).toHaveProperty("total")
      expect(response.body).toHaveProperty("page")
      expect(response.body).toHaveProperty("limit")
      expect(response.body).toHaveProperty("totalPages")
    })

    it("should return transfers for existing environmental asset", async () => {
      const treasury = await internalTreasuryRepository.save({
        contractId: "0.0.123456",
        bondContractId: "0.0.789012",
        paused: false,
      })

      const environmentalAsset = await internalEnvironmentalAssetRepository.save({
        contractId: "0.0.111111",
        treasuryId: treasury.id,
      })

      const transfer1 = await internalEnvironmentalAssetTransferRepository.save({
        accountId: "0.0.111111",
        environmentalAssetId: environmentalAsset.id,
        tokenId: 1,
        type: TransferType.INFLOW,
      })

      const transfer2 = await internalEnvironmentalAssetTransferRepository.save({
        accountId: "0.0.222222",
        environmentalAssetId: environmentalAsset.id,
        tokenId: 2,
        type: TransferType.OUTFLOW,
      })

      const response = await request(app.getHttpServer())
        .get(`/api/treasuries/${treasury.contractId}/environmental-assets/${environmentalAsset.contractId}/transfers`)
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
        tokenId: transfer1.tokenId,
        type: transfer1.type,
        transferDate: expect.any(String),
      })

      expect(item2).toEqual({
        accountId: transfer2.accountId,
        tokenId: transfer2.tokenId,
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

      const environmentalAsset = await internalEnvironmentalAssetRepository.save({
        contractId: "0.0.111111",
        treasuryId: treasury.id,
      })

      for (let i = 1; i <= 5; i++) {
        await internalEnvironmentalAssetTransferRepository.save({
          accountId: `0.0.${111110 + i}`,
          environmentalAssetId: environmentalAsset.id,
          tokenId: i,
          type: i % 2 === 0 ? TransferType.INFLOW : TransferType.OUTFLOW,
        })
      }

      const response = await request(app.getHttpServer())
        .get(`/api/treasuries/${treasury.contractId}/environmental-assets/${environmentalAsset.contractId}/transfers`)
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

      const environmentalAsset = await internalEnvironmentalAssetRepository.save({
        contractId: "0.0.111111",
        treasuryId: treasury.id,
      })

      const transfer1 = await internalEnvironmentalAssetTransferRepository.save({
        accountId: "0.0.111111",
        environmentalAssetId: environmentalAsset.id,
        tokenId: 1,
        type: TransferType.INFLOW,
      })

      await new Promise((resolve) => setTimeout(resolve, 10))

      const transfer2 = await internalEnvironmentalAssetTransferRepository.save({
        accountId: "0.0.222222",
        environmentalAssetId: environmentalAsset.id,
        tokenId: 2,
        type: TransferType.OUTFLOW,
      })

      const response = await request(app.getHttpServer())
        .get(`/api/treasuries/${treasury.contractId}/environmental-assets/${environmentalAsset.contractId}/transfers`)
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
      const nonExistentAssetId = "0.0.999999"

      await request(app.getHttpServer())
        .get(`/api/treasuries/${treasury.contractId}/environmental-assets/${nonExistentAssetId}/transfers`)
        .expect(404)
    })

    it("should filter transfers by environmental asset", async () => {
      const treasury = await internalTreasuryRepository.save({
        contractId: "0.0.123456",
        bondContractId: "0.0.789012",
        paused: false,
      })

      const environmentalAsset1 = await internalEnvironmentalAssetRepository.save({
        contractId: "0.0.111111",
        treasuryId: treasury.id,
      })

      const environmentalAsset2 = await internalEnvironmentalAssetRepository.save({
        contractId: "0.0.222222",
        treasuryId: treasury.id,
      })

      await internalEnvironmentalAssetTransferRepository.save({
        accountId: "0.0.111111",
        environmentalAssetId: environmentalAsset1.id,
        tokenId: 1,
        type: TransferType.INFLOW,
      })

      await internalEnvironmentalAssetTransferRepository.save({
        accountId: "0.0.222222",
        environmentalAssetId: environmentalAsset2.id,
        tokenId: 2,
        type: TransferType.OUTFLOW,
      })

      const response = await request(app.getHttpServer())
        .get(`/api/treasuries/${treasury.contractId}/environmental-assets/${environmentalAsset1.contractId}/transfers`)
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

      const environmentalAsset = await internalEnvironmentalAssetRepository.save({
        contractId: "0.0.111111",
        treasuryId: treasury.id,
      })

      await internalEnvironmentalAssetTransferRepository.save({
        accountId: "0.0.111111",
        environmentalAssetId: environmentalAsset.id,
        tokenId: 1,
        type: TransferType.INFLOW,
      })

      await internalEnvironmentalAssetTransferRepository.save({
        accountId: "0.0.222222",
        environmentalAssetId: environmentalAsset.id,
        tokenId: 2,
        type: TransferType.OUTFLOW,
      })

      const response = await request(app.getHttpServer())
        .get(`/api/treasuries/${treasury.contractId}/environmental-assets/${environmentalAsset.contractId}/transfers`)
        .expect(200)

      expect(response.body.items).toHaveLength(2)

      const inflowTransfer = response.body.items.find((item: any) => item.type === TransferType.INFLOW)
      const outflowTransfer = response.body.items.find((item: any) => item.type === TransferType.OUTFLOW)

      expect(inflowTransfer).toBeDefined()
      expect(inflowTransfer.accountId).toBe("0.0.111111")
      expect(inflowTransfer.tokenId).toBe(1)

      expect(outflowTransfer).toBeDefined()
      expect(outflowTransfer.accountId).toBe("0.0.222222")
      expect(outflowTransfer.tokenId).toBe(2)
    })

    it("should filter transfers by type=OUTFLOW query param", async () => {
      const treasury = await internalTreasuryRepository.save({
        contractId: "0.0.123456",
        bondContractId: "0.0.789012",
        paused: false,
      })

      const environmentalAsset = await internalEnvironmentalAssetRepository.save({
        contractId: "0.0.111111",
        treasuryId: treasury.id,
      })

      await internalEnvironmentalAssetTransferRepository.save({
        accountId: "0.0.111111",
        environmentalAssetId: environmentalAsset.id,
        tokenId: 1,
        type: TransferType.INFLOW,
      })

      await internalEnvironmentalAssetTransferRepository.save({
        accountId: "0.0.222222",
        environmentalAssetId: environmentalAsset.id,
        tokenId: 2,
        type: TransferType.OUTFLOW,
      })

      const response = await request(app.getHttpServer())
        .get(`/api/treasuries/${treasury.contractId}/environmental-assets/${environmentalAsset.contractId}/transfers`)
        .query({ type: TransferType.OUTFLOW })
        .expect(200)

      expect(response.body.items).toHaveLength(1)
      expect(response.body.items[0].type).toBe(TransferType.OUTFLOW)
      expect(response.body.items[0].accountId).toBe("0.0.222222")
      expect(response.body.items[0].tokenId).toBe(2)
    })

    it("should return all transfers when type is not provided", async () => {
      const treasury = await internalTreasuryRepository.save({
        contractId: "0.0.123456",
        bondContractId: "0.0.789012",
        paused: false,
      })

      const environmentalAsset = await internalEnvironmentalAssetRepository.save({
        contractId: "0.0.111111",
        treasuryId: treasury.id,
      })

      await internalEnvironmentalAssetTransferRepository.save({
        accountId: "0.0.111111",
        environmentalAssetId: environmentalAsset.id,
        tokenId: 1,
        type: TransferType.INFLOW,
      })

      await internalEnvironmentalAssetTransferRepository.save({
        accountId: "0.0.222222",
        environmentalAssetId: environmentalAsset.id,
        tokenId: 2,
        type: TransferType.OUTFLOW,
      })

      const response = await request(app.getHttpServer())
        .get(`/api/treasuries/${treasury.contractId}/environmental-assets/${environmentalAsset.contractId}/transfers`)
        .expect(200)

      expect(response.body.items).toHaveLength(2)
      const types = response.body.items.map((i: any) => i.type).sort()
      expect(types).toEqual([TransferType.INFLOW, TransferType.OUTFLOW].sort())
    })
  })
})
