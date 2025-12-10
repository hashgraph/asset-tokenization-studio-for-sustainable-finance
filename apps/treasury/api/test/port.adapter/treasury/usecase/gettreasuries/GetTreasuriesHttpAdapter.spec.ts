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

describe("GetTreasuries API Integration", () => {
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

    internalTreasuryRepository = moduleFixture.get<Repository<TreasuryPersistence>>(
      getRepositoryToken(TreasuryPersistence),
    )
  })
  afterEach(async () => {
    await internalTreasuryRepository.deleteAll()
    if (app) {
      await app.close()
    }
  })

  describe("GET /treasuries", () => {
    it("should return empty list when no treasuries exist", async () => {
      const response = await request(app.getHttpServer()).get(`/api/v1/treasuries`).expect(200)

      expect(response.body).toEqual({
        items: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      })
    })

    it("should return treasuries when they exist", async () => {
      const treasury1 = await internalTreasuryRepository.save({
        contractId: "0.0.123456",
        bondContractId: "0.0.789012",
        paused: false,
      })

      const treasury2 = await internalTreasuryRepository.save({
        contractId: "0.0.223456",
        bondContractId: "0.0.889012",
        paused: true,
      })

      const response = await request(app.getHttpServer()).get(`/api/v1/treasuries`).expect(200)

      expect(response.body.total).toBe(2)
      expect(response.body.page).toBe(1)
      expect(response.body.limit).toBe(10)
      expect(response.body.totalPages).toBe(1)
      expect(response.body.items).toHaveLength(2)

      // Ordenar los items por contractId para hacer las validaciones determinísticas
      const sortedItems = response.body.items.sort((a: any, b: any) => a.contractId.localeCompare(b.contractId))

      expect(sortedItems[0]).toEqual({
        contractId: "0.0.123456",
        bondContractId: "0.0.789012",
        paused: false,
        createdAt: treasury1.createdAt.toISOString(),
      })

      expect(sortedItems[1]).toEqual({
        contractId: "0.0.223456",
        bondContractId: "0.0.889012",
        paused: true,
        createdAt: treasury2.createdAt.toISOString(),
      })
    })

    it("should handle pagination parameters", async () => {
      for (let i = 1; i <= 5; i++) {
        await internalTreasuryRepository.save({
          contractId: `0.0.${123450 + i}`,
          bondContractId: `0.0.${789010 + i}`,
          paused: false,
        })
      }

      const response = await request(app.getHttpServer())
        .get(`/api/v1/treasuries`)
        .query({ page: 1, limit: 3 })
        .expect(200)

      expect(response.body.total).toBe(5)
      expect(response.body.page).toBe(1)
      expect(response.body.limit).toBe(3)
      expect(response.body.totalPages).toBe(2)
      expect(response.body.items).toHaveLength(3)
    })

    it("should handle ordering parameters", async () => {
      const treasury1 = await internalTreasuryRepository.save({
        contractId: "0.0.111111",
        bondContractId: "0.0.777777",
        paused: false,
      })

      await new Promise((resolve) => setTimeout(resolve, 10))

      const treasury2 = await internalTreasuryRepository.save({
        contractId: "0.0.222222",
        bondContractId: "0.0.888888",
        paused: true,
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/treasuries`)
        .query({ orderBy: "createdAt", order: "ASC" })
        .expect(200)

      expect(response.body.items).toHaveLength(2)
      expect(response.body.items[0].contractId).toBe(treasury1.contractId)
      expect(response.body.items[1].contractId).toBe(treasury2.contractId)
    })
  })
})
