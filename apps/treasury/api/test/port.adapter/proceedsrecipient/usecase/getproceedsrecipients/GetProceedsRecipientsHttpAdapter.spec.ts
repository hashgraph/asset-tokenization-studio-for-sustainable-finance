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
import { ProceedsRecipientPersistence } from "@port/persistence/proceedsrecipient/model/ProceedsRecipientPersistence"

describe("GetProceedsRecipients API Integration", () => {
  let app: INestApplication
  let internalTreasuryRepository: Repository<TreasuryPersistence>
  let internalProceedsRecipientRepository: Repository<ProceedsRecipientPersistence>
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
    internalProceedsRecipientRepository = moduleFixture.get<Repository<ProceedsRecipientPersistence>>(
      getRepositoryToken(ProceedsRecipientPersistence),
    )
  })
  afterEach(async () => {
    await internalProceedsRecipientRepository.deleteAll()
    await internalTreasuryRepository.deleteAll()
    if (app) {
      await app.close()
    }
  })

  describe("GET /treasuries/:treasuryContractId/proceeds-recipients", () => {
    it("should return empty list when treasury has no proceeds recipients", async () => {
      const treasury = await internalTreasuryRepository.save({
        contractId: "0.0.123456",
        bondContractId: "0.0.789012",
        paused: false,
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/treasuries/${treasury.contractId}/proceeds-recipients`)
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

    it("should return proceeds recipients for existing treasury", async () => {
      const treasury = await internalTreasuryRepository.save({
        contractId: "0.0.123456",
        bondContractId: "0.0.789012",
        paused: false,
      })

      const recipient1 = await internalProceedsRecipientRepository.save({
        contractId: "0.0.111111",
        treasuryId: treasury.id,
      })

      const recipient2 = await internalProceedsRecipientRepository.save({
        contractId: "0.0.222222",
        treasuryId: treasury.id,
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/treasuries/${treasury.contractId}/proceeds-recipients`)
        .query({ page: 1, limit: 10 })
        .expect(200)

      expect(response.body.total).toBe(2)
      expect(response.body.page).toBe(1)
      expect(response.body.limit).toBe(10)
      expect(response.body.totalPages).toBe(1)
      expect(response.body.items).toHaveLength(2)

      const item1 = response.body.items.find((item: any) => item.contractId === recipient1.contractId)
      const item2 = response.body.items.find((item: any) => item.contractId === recipient2.contractId)

      expect(item1).toEqual({
        contractId: recipient1.contractId,
        createdAt: expect.any(String),
      })

      expect(item2).toEqual({
        contractId: recipient2.contractId,
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
        await internalProceedsRecipientRepository.save({
          contractId: `0.0.${111111 + i}`,
          treasuryId: treasury.id,
        })
      }

      const response = await request(app.getHttpServer())
        .get(`/api/v1/treasuries/${treasury.contractId}/proceeds-recipients`)
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
        .get(`/api/v1/treasuries/0.0.999999/proceeds-recipients`)
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
        await internalProceedsRecipientRepository.save({
          contractId: `0.0.${111111 + i}`,
          treasuryId: treasury.id,
        })
      }

      const response = await request(app.getHttpServer())
        .get(`/api/v1/treasuries/${treasury.contractId}/proceeds-recipients`)
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
