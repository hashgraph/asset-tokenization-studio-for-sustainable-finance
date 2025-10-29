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
import { DistributionPersistence } from "@port/persistence/distribution/model/DistributionPersistence"
import { DistributionHolderPersistence } from "@port/persistence/distribution/model/DistributionHolderPersistence"

describe("GetDistributionHolders API Integration", () => {
  let app: INestApplication
  let container: PostgreSqlContainer
  let internalTreasuryRepository: Repository<TreasuryPersistence>
  let internalDistributionRepository: Repository<DistributionPersistence>
  let internalDistributionHolderRepository: Repository<DistributionHolderPersistence>

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
    internalDistributionRepository = moduleFixture.get<Repository<DistributionPersistence>>(
      getRepositoryToken(DistributionPersistence),
    )
    internalDistributionHolderRepository = moduleFixture.get<Repository<DistributionHolderPersistence>>(
      getRepositoryToken(DistributionHolderPersistence),
    )
  })

  afterAll(async () => {
    await container.stop()
  })

  afterEach(async () => {
    await internalDistributionHolderRepository.deleteAll()
    await internalDistributionRepository.deleteAll()
    await internalTreasuryRepository.deleteAll()
    if (app) {
      await app.close()
    }
  })

  describe("GET /:treasuryContractId/distributions/:distributionId/holders", () => {
    it("should return empty list when distribution has no holders", async () => {
      const treasury = await internalTreasuryRepository.save({
        contractId: "0.0.123456",
        bondContractId: "0.0.789012",
        paused: false,
      })

      const distribution = await internalDistributionRepository.save({
        id: 1,
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/treasuries/${treasury.contractId}/distributions/${distribution.id}/holders`)
        .expect(200)

      expect(response.body).toHaveProperty("items")
      expect(response.body.items).toEqual([])
      expect(response.body).toHaveProperty("total")
      expect(response.body).toHaveProperty("page")
      expect(response.body).toHaveProperty("limit")
      expect(response.body).toHaveProperty("totalPages")
    })

    it("should return holders for existing distribution", async () => {
      const treasury = await internalTreasuryRepository.save({
        contractId: "0.0.123456",
        bondContractId: "0.0.789012",
        paused: false,
      })

      const distribution = await internalDistributionRepository.save({
        id: 1,
      })

      const holder1 = await internalDistributionHolderRepository.save({
        holderAccountId: "0.0.111111",
        status: "SUCCESS",
        amount: "1000000000",
        distributionId: distribution.id,
      })

      const holder2 = await internalDistributionHolderRepository.save({
        holderAccountId: "0.0.222222",
        status: "FAILED",
        amount: "2000000000",
        distributionId: distribution.id,
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/treasuries/${treasury.contractId}/distributions/${distribution.id}/holders`)
        .expect(200)

      expect(response.body.total).toBe(2)
      expect(response.body.page).toBe(1)
      expect(response.body.limit).toBe(10)
      expect(response.body.totalPages).toBe(1)
      expect(response.body.items).toHaveLength(2)

      const item1 = response.body.items.find((item: any) => item.holderAccountId === holder1.holderAccountId)
      const item2 = response.body.items.find((item: any) => item.holderAccountId === holder2.holderAccountId)

      expect(item1).toEqual({
        holderAccountId: holder1.holderAccountId,
        amount: holder1.amount,
        status: holder1.status,
      })

      expect(item2).toEqual({
        holderAccountId: holder2.holderAccountId,
        amount: holder2.amount,
        status: holder2.status,
      })
    })

    it("should handle pagination parameters", async () => {
      const treasury = await internalTreasuryRepository.save({
        contractId: "0.0.123456",
        bondContractId: "0.0.789012",
        paused: false,
      })

      const distribution = await internalDistributionRepository.save({
        id: 1,
      })

      for (let i = 1; i <= 5; i++) {
        await internalDistributionHolderRepository.save({
          holderAccountId: `0.0.${111110 + i}`,
          distributionId: distribution.id,
          amount: "1000000000",
          status: i % 2 === 0 ? "SUCCESS" : "FAILED",
        })
      }

      const response = await request(app.getHttpServer())
        .get(`/api/v1/treasuries/${treasury.contractId}/distributions/${distribution.id}/holders`)
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

      const distribution = await internalDistributionRepository.save({
        id: 1,
      })

      const holder1 = await internalDistributionHolderRepository.save({
        holderAccountId: "0.0.111111",
        distributionId: distribution.id,
        amount: "1000000000",
        status: "SUCCESS",
      })

      await new Promise((resolve) => setTimeout(resolve, 10))

      const holder2 = await internalDistributionHolderRepository.save({
        holderAccountId: "0.0.222222",
        distributionId: distribution.id,
        amount: "2000000000",
        status: "FAILED",
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/treasuries/${treasury.contractId}/distributions/${distribution.id}/holders`)
        .query({ orderBy: "createdAt", order: "ASC" })
        .expect(200)

      expect(response.body.items).toHaveLength(2)
      expect(response.body.items[0].holderAccountId).toBe(holder1.holderAccountId)
      expect(response.body.items[1].holderAccountId).toBe(holder2.holderAccountId)
    })

    it("should return 404 when distribution does not exist", async () => {
      const treasury = await internalTreasuryRepository.save({
        contractId: "0.0.123456",
        bondContractId: "0.0.789012",
        paused: false,
      })
      const nonExistentDistributionId = 999

      await request(app.getHttpServer())
        .get(`/api/v1/treasuries/${treasury.contractId}/distributions/${nonExistentDistributionId}/holders`)
        .expect(404)
    })

    it("should filter holders by distribution", async () => {
      const treasury = await internalTreasuryRepository.save({
        contractId: "0.0.123456",
        bondContractId: "0.0.789012",
        paused: false,
      })

      const distribution1 = await internalDistributionRepository.save({
        id: 1,
      })

      const distribution2 = await internalDistributionRepository.save({
        id: 2,
      })

      await internalDistributionHolderRepository.save({
        holderAccountId: "0.0.111111",
        distributionId: distribution1.id,
        amount: "1000000000",
        status: "SUCCESS",
      })

      await internalDistributionHolderRepository.save({
        holderAccountId: "0.0.222222",
        distributionId: distribution2.id,
        amount: "2000000000",
        status: "FAILED",
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/treasuries/${treasury.contractId}/distributions/${distribution1.id}/holders`)
        .expect(200)

      expect(response.body.total).toBe(1)
      expect(response.body.items).toHaveLength(1)
      expect(response.body.items[0].holderAccountId).toBe("0.0.111111")
    })

    it("should return holders with correct statuses", async () => {
      const treasury = await internalTreasuryRepository.save({
        contractId: "0.0.123456",
        bondContractId: "0.0.789012",
        paused: false,
      })

      const distribution = await internalDistributionRepository.save({
        id: 1,
      })

      await internalDistributionHolderRepository.save({
        holderAccountId: "0.0.111111",
        distributionId: distribution.id,
        amount: "1000000000",
        status: "SUCCESS",
      })

      await internalDistributionHolderRepository.save({
        holderAccountId: "0.0.222222",
        distributionId: distribution.id,
        amount: "2000000000",
        status: "FAILED",
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/treasuries/${treasury.contractId}/distributions/${distribution.id}/holders`)
        .expect(200)

      expect(response.body.items).toHaveLength(2)

      const successHolder = response.body.items.find((item: any) => item.status === "SUCCESS")
      const failedHolder = response.body.items.find((item: any) => item.status === "FAILED")

      expect(successHolder).toBeDefined()
      expect(successHolder.holderAccountId).toBe("0.0.111111")
      expect(successHolder.amount).toBe("1000000000")

      expect(failedHolder).toBeDefined()
      expect(failedHolder.holderAccountId).toBe("0.0.222222")
      expect(failedHolder.amount).toBe("2000000000")
    })

    it("should filter holders by status=SUCCESS query param", async () => {
      const treasury = await internalTreasuryRepository.save({
        contractId: "0.0.123456",
        bondContractId: "0.0.789012",
        paused: false,
      })

      const distribution = await internalDistributionRepository.save({
        id: 1,
      })

      await internalDistributionHolderRepository.save({
        holderAccountId: "0.0.111111",
        distributionId: distribution.id,
        amount: "1000000000",
        status: "SUCCESS",
      })

      await internalDistributionHolderRepository.save({
        holderAccountId: "0.0.222222",
        distributionId: distribution.id,
        amount: "2000000000",
        status: "FAILED",
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/treasuries/${treasury.contractId}/distributions/${distribution.id}/holders`)
        .query({ status: "SUCCESS" })
        .expect(200)

      expect(response.body.items).toHaveLength(1)
      expect(response.body.items[0].status).toBe("SUCCESS")
      expect(response.body.items[0].holderAccountId).toBe("0.0.111111")
      expect(response.body.items[0].amount).toBe("1000000000")
    })

    it("should filter holders by status=FAILED query param", async () => {
      const treasury = await internalTreasuryRepository.save({
        contractId: "0.0.123456",
        bondContractId: "0.0.789012",
        paused: false,
      })

      const distribution = await internalDistributionRepository.save({
        id: 1,
      })

      await internalDistributionHolderRepository.save({
        holderAccountId: "0.0.111111",
        distributionId: distribution.id,
        amount: "1000000000",
        status: "SUCCESS",
      })

      await internalDistributionHolderRepository.save({
        holderAccountId: "0.0.222222",
        distributionId: distribution.id,
        amount: "2000000000",
        status: "FAILED",
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/treasuries/${treasury.contractId}/distributions/${distribution.id}/holders`)
        .query({ status: "FAILED" })
        .expect(200)

      expect(response.body.items).toHaveLength(1)
      expect(response.body.items[0].status).toBe("FAILED")
      expect(response.body.items[0].holderAccountId).toBe("0.0.222222")
      expect(response.body.items[0].amount).toBe("2000000000")
    })

    it("should return all holders when status is not provided", async () => {
      const treasury = await internalTreasuryRepository.save({
        contractId: "0.0.123456",
        bondContractId: "0.0.789012",
        paused: false,
      })

      const distribution = await internalDistributionRepository.save({
        id: 1,
      })

      await internalDistributionHolderRepository.save({
        holderAccountId: "0.0.111111",
        distributionId: distribution.id,
        amount: "1000000000",
        status: "SUCCESS",
      })

      await internalDistributionHolderRepository.save({
        holderAccountId: "0.0.222222",
        distributionId: distribution.id,
        amount: "2000000000",
        status: "FAILED",
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/treasuries/${treasury.contractId}/distributions/${distribution.id}/holders`)
        .expect(200)

      expect(response.body.items).toHaveLength(2)
      const statuses = response.body.items.map((i: any) => i.status).sort()
      expect(statuses).toEqual(["FAILED", "SUCCESS"])
    })
  })
})
