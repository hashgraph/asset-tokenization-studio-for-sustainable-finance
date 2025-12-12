// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { HttpStatus, INestApplication } from "@nestjs/common"
import request from "supertest"
import { CONTROLLERS, PROVIDERS } from "@components"
import { SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "@test/shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"
import { Repository } from "typeorm"
import { getRepositoryToken } from "@nestjs/typeorm"
import { BondHolderBalancePersistence } from "@port/holderbalance/persistence/model/BondHolderBalancePersistence"
import { BondPersistence } from "@port/bond/persistence/model/BondPersistence"

describe("GetBondHoldersHttpAdapter API Integration", () => {
  let app: INestApplication
  let bondHolderBalanceRepository: Repository<BondHolderBalancePersistence>
  let bondRepository: Repository<BondPersistence>
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SharedModule, PostgresModule.forRoot(PostgreSqlContainer.getWorkerConfig())],
      controllers: CONTROLLERS,
      providers: [...PROVIDERS],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.setGlobalPrefix("api/v1/ats")
    app.useLogger(false)
    await app.init()
    bondHolderBalanceRepository = app.get(getRepositoryToken(BondHolderBalancePersistence))
    bondRepository = app.get(getRepositoryToken(BondPersistence))
  })
  afterEach(async () => {
    if (bondHolderBalanceRepository) {
      await bondHolderBalanceRepository.query('DELETE FROM "Bonds"')
    }
    if (bondRepository) {
      await bondRepository.query('DELETE FROM "Bonds"')
    }
    if (app) {
      await app.close()
    }
  })

  describe("GET /:bondContractId/holders", () => {
    const createBond = async (contractId: string) => {
      await bondRepository.save({
        contractId: contractId,
        treasuryId: contractId,
        kpiId: contractId,
        name: "Test Bond",
        symbol: "TEST",
        decimals: 18,
        currency: "USD",
        nominalValue: "1000",
        nominalValueDecimals: 2,
        startingDate: new Date("2025-01-01"),
        maturityDate: new Date("2030-01-01"),
        maxSupply: "1000000",
        isin: "US0000000000",
      })
    }

    it("should return empty page when no holders exist", async () => {
      const bondContractId = "0.0.6823801"
      await createBond(bondContractId)

      const response = await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bondContractId}/holders`)
        .query({ page: 1, limit: 10 })
        .expect(HttpStatus.OK)

      expect(response.body).toEqual({
        items: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      })
    })

    it("should return paginated bond holders with correct structure", async () => {
      const bondContractId = "0.0.6823801"
      await createBond(bondContractId)

      const holder = await bondHolderBalanceRepository.save({
        bondContractId: bondContractId,
        holderAccountId: "0.0.1001",
        partition: "default",
        availableBalance: "1000",
        lockedBalance: "500",
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bondContractId}/holders`)
        .query({ page: 1, limit: 10 })
        .expect(HttpStatus.OK)

      expect(response.body.items).toHaveLength(1)
      expect(response.body.total).toBe(1)
      expect(response.body.page).toBe(1)
      expect(response.body.limit).toBe(10)
      expect(response.body.totalPages).toBe(1)

      const holderResponse = response.body.items[0]
      expect(holderResponse).toMatchObject({
        id: holder.id,
        bondContractId: holder.bondContractId,
        holderAccountId: holder.holderAccountId,
        partition: holder.partition,
        availableBalance: holder.availableBalance,
        lockedBalance: holder.lockedBalance,
      })
    })

    it("should filter holders by bondContractId", async () => {
      const bondContractId1 = "0.0.6823801"
      const bondContractId2 = "0.0.6823802"
      await createBond(bondContractId1)
      await createBond(bondContractId2)

      await bondHolderBalanceRepository.save([
        {
          bondContractId: bondContractId1,
          holderAccountId: "0.0.1001",
          partition: "default",
          availableBalance: "1000",
          lockedBalance: "0",
        },
        {
          bondContractId: bondContractId1,
          holderAccountId: "0.0.1002",
          partition: "default",
          availableBalance: "2000",
          lockedBalance: "0",
        },
        {
          bondContractId: bondContractId2,
          holderAccountId: "0.0.1003",
          partition: "default",
          availableBalance: "3000",
          lockedBalance: "0",
        },
      ])

      const response = await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bondContractId1}/holders`)
        .query({ page: 1, limit: 10 })
        .expect(HttpStatus.OK)

      expect(response.body.items).toHaveLength(2)
      expect(response.body.total).toBe(2)
      expect(response.body.items.every((item: any) => item.bondContractId === bondContractId1)).toBe(true)
    })

    it("should handle pagination correctly", async () => {
      const bondContractId = "0.0.6823801"
      await createBond(bondContractId)

      for (let i = 1; i <= 3; i++) {
        await bondHolderBalanceRepository.save({
          bondContractId: bondContractId,
          holderAccountId: `0.0.${1000 + i}`,
          partition: "default",
          availableBalance: `${i * 1000}`,
          lockedBalance: "0",
        })
      }

      const response = await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bondContractId}/holders`)
        .query({ page: 2, limit: 2 })
        .expect(HttpStatus.OK)

      expect(response.body.page).toBe(2)
      expect(response.body.limit).toBe(2)
      expect(response.body.total).toBe(3)
      expect(response.body.totalPages).toBe(2)
      expect(response.body.items).toHaveLength(1)
    })

    it("should order holders by holderAccountId", async () => {
      const bondContractId = "0.0.6823801"
      await createBond(bondContractId)

      await bondHolderBalanceRepository.save({
        bondContractId: bondContractId,
        holderAccountId: "0.0.9999",
        partition: "default",
        availableBalance: "1000",
        lockedBalance: "0",
      })

      await bondHolderBalanceRepository.save({
        bondContractId: bondContractId,
        holderAccountId: "0.0.1001",
        partition: "default",
        availableBalance: "2000",
        lockedBalance: "0",
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bondContractId}/holders`)
        .query({ orderBy: "holderAccountId", order: "ASC" })
        .expect(HttpStatus.OK)

      expect(response.body.items).toHaveLength(2)
      expect(response.body.items[0].holderAccountId).toBe("0.0.1001")
      expect(response.body.items[1].holderAccountId).toBe("0.0.9999")
    })

    it("should validate pagination parameters", async () => {
      const bondContractId = "0.0.6823801"

      await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bondContractId}/holders`)
        .query({ page: -1 })
        .expect(HttpStatus.BAD_REQUEST)

      await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bondContractId}/holders`)
        .query({ limit: 0 })
        .expect(HttpStatus.BAD_REQUEST)

      await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bondContractId}/holders`)
        .query({ order: "INVALID" })
        .expect(HttpStatus.BAD_REQUEST)
    })

    it("should handle multiple holders with different partitions", async () => {
      const bondContractId = "0.0.6823801"
      const holderAccountId = "0.0.1001"
      await createBond(bondContractId)

      await bondHolderBalanceRepository.save([
        {
          bondContractId: bondContractId,
          holderAccountId: holderAccountId,
          partition: "partition1",
          availableBalance: "1000",
          lockedBalance: "100",
        },
        {
          bondContractId: bondContractId,
          holderAccountId: holderAccountId,
          partition: "partition2",
          availableBalance: "2000",
          lockedBalance: "200",
        },
      ])

      const response = await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bondContractId}/holders`)
        .query({ page: 1, limit: 10 })
        .expect(HttpStatus.OK)

      expect(response.body.items).toHaveLength(2)
      expect(response.body.total).toBe(2)
      expect(response.body.items[0].partition).not.toBe(response.body.items[1].partition)
    })
  })
})
