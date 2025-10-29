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

describe("GetDistributions API Integration", () => {
  let app: INestApplication
  let container: PostgreSqlContainer
  let internalTreasuryRepository: Repository<TreasuryPersistence>
  let internalDistributionRepository: Repository<DistributionPersistence>

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
  })

  afterAll(async () => {
    await container.stop()
  })

  afterEach(async () => {
    await internalDistributionRepository.deleteAll()
    await internalTreasuryRepository.deleteAll()
    if (app) {
      await app.close()
    }
  })

  describe("GET /treasuries/:treasuryContractId/distributions", () => {
    it("should return empty list when treasury has no distributions", async () => {
      const treasury = await internalTreasuryRepository.save({
        contractId: "0.0.123456",
        bondContractId: "0.0.789012",
        paused: false,
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/treasuries/${treasury.contractId}/distributions`)
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

    it("should return distributions for existing treasury", async () => {
      const treasury = await internalTreasuryRepository.save({
        contractId: "0.0.123456",
        bondContractId: "0.0.789012",
        paused: false,
      })

      const distribution1 = await internalDistributionRepository.save({
        id: 1,
        treasuryId: treasury.id,
      })

      const distribution2 = await internalDistributionRepository.save({
        id: 2,
        treasuryId: treasury.id,
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/treasuries/${treasury.contractId}/distributions`)
        .query({ page: 1, limit: 10 })
        .expect(200)

      expect(response.body.total).toBe(2)
      expect(response.body.page).toBe(1)
      expect(response.body.limit).toBe(10)
      expect(response.body.totalPages).toBe(1)
      expect(response.body.items).toHaveLength(2)

      const item1 = response.body.items.find((item: any) => item.id === distribution1.id)
      const item2 = response.body.items.find((item: any) => item.id === distribution2.id)

      expect(item1).toEqual({
        id: distribution1.id,
        createdAt: expect.any(String),
      })

      expect(item2).toEqual({
        id: distribution2.id,
        createdAt: expect.any(String),
      })
    })

    it("should handle pagination parameters", async () => {
      const treasury = await internalTreasuryRepository.save({
        contractId: "0.0.123456",
        bondContractId: "0.0.789012",
        paused: false,
      })

      for (let i = 1; i <= 5; i++) {
        await internalDistributionRepository.save({
          id: i,
          treasuryId: treasury.id,
        })
      }

      const response = await request(app.getHttpServer())
        .get(`/api/v1/treasuries/${treasury.contractId}/distributions`)
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
        .get(`/api/v1/treasuries/0.0.999999/distributions`)
        .query({ page: 1, limit: 10 })
        .expect(404)

      expect(response.body).toHaveProperty("message")
    })

    it("should return second page of results", async () => {
      const treasury = await internalTreasuryRepository.save({
        contractId: "0.0.123456",
        bondContractId: "0.0.789012",
        paused: false,
      })

      for (let i = 1; i <= 5; i++) {
        await internalDistributionRepository.save({
          id: i,
          treasuryId: treasury.id,
        })
      }

      const response = await request(app.getHttpServer())
        .get(`/api/v1/treasuries/${treasury.contractId}/distributions`)
        .query({ page: 2, limit: 3 })
        .expect(200)

      expect(response.body.total).toBe(5)
      expect(response.body.page).toBe(2)
      expect(response.body.limit).toBe(3)
      expect(response.body.totalPages).toBe(2)
      expect(response.body.items).toHaveLength(2)
    })
  })
})
