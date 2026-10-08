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

describe("GetHolderBalancesHttpAdapter API Integration", () => {
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

  describe("GET /:bondContractId/holders/:holderAccountId/balances", () => {
    const createBond = async (contractId: string) => {
      await bondRepository.save({
        contractId: contractId,
        treasuryId: contractId,
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

    it("should return empty page when holder has no balances", async () => {
      const bondContractId = "0.0.6823801"
      const holderAccountId = "0.0.1001"
      await createBond(bondContractId)

      const response = await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/balances`)
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

    it("should return holder balances with all balance types", async () => {
      const bondContractId = "0.0.6823801"
      const holderAccountId = "0.0.1001"
      await createBond(bondContractId)

      const balance = await bondHolderBalanceRepository.save({
        bondContractId: bondContractId,
        holderAccountId: holderAccountId,
        partition: "default",
        availableBalance: "1000",
        lockedBalance: "500",
        heldBalance: "200",
        clearingBalance: "100",
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/balances`)
        .query({ page: 1, limit: 10 })
        .expect(HttpStatus.OK)

      expect(response.body.items).toHaveLength(1)
      expect(response.body.total).toBe(1)
      expect(response.body.page).toBe(1)
      expect(response.body.limit).toBe(10)
      expect(response.body.totalPages).toBe(1)

      const balanceResponse = response.body.items[0]
      expect(balanceResponse).toMatchObject({
        id: balance.id,
        bondContractId: balance.bondContractId,
        holderAccountId: balance.holderAccountId,
        partition: balance.partition,
        availableBalance: balance.availableBalance,
        lockedBalance: balance.lockedBalance,
        heldBalance: balance.heldBalance,
        clearingBalance: balance.clearingBalance,
      })
    })

    it("should filter balances by bondContractId and holderAccountId", async () => {
      const bondContractId1 = "0.0.6823801"
      const bondContractId2 = "0.0.6823802"
      const holderAccountId1 = "0.0.1001"
      const holderAccountId2 = "0.0.1002"
      await createBond(bondContractId1)
      await createBond(bondContractId2)

      await bondHolderBalanceRepository.save([
        {
          bondContractId: bondContractId1,
          holderAccountId: holderAccountId1,
          partition: "partition1",
          availableBalance: "1000",
          lockedBalance: "100",
          heldBalance: "50",
          clearingBalance: "25",
        },
        {
          bondContractId: bondContractId1,
          holderAccountId: holderAccountId1,
          partition: "partition2",
          availableBalance: "2000",
          lockedBalance: "200",
          heldBalance: "100",
          clearingBalance: "50",
        },
        {
          bondContractId: bondContractId1,
          holderAccountId: holderAccountId2,
          partition: "default",
          availableBalance: "3000",
          lockedBalance: "0",
          heldBalance: "0",
          clearingBalance: "0",
        },
        {
          bondContractId: bondContractId2,
          holderAccountId: holderAccountId1,
          partition: "default",
          availableBalance: "4000",
          lockedBalance: "0",
          heldBalance: "0",
          clearingBalance: "0",
        },
      ])

      const response = await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bondContractId1}/holders/${holderAccountId1}/balances`)
        .query({ page: 1, limit: 10 })
        .expect(HttpStatus.OK)

      expect(response.body.items).toHaveLength(2)
      expect(response.body.total).toBe(2)
      expect(response.body.items.every((item: any) => item.bondContractId === bondContractId1)).toBe(true)
      expect(response.body.items.every((item: any) => item.holderAccountId === holderAccountId1)).toBe(true)
    })

    it("should return multiple partitions for the same holder", async () => {
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
          heldBalance: "50",
          clearingBalance: "25",
        },
        {
          bondContractId: bondContractId,
          holderAccountId: holderAccountId,
          partition: "partition2",
          availableBalance: "2000",
          lockedBalance: "200",
          heldBalance: "100",
          clearingBalance: "50",
        },
        {
          bondContractId: bondContractId,
          holderAccountId: holderAccountId,
          partition: "partition3",
          availableBalance: "3000",
          lockedBalance: "300",
          heldBalance: "150",
          clearingBalance: "75",
        },
      ])

      const response = await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/balances`)
        .query({ page: 1, limit: 10 })
        .expect(HttpStatus.OK)

      expect(response.body.items).toHaveLength(3)
      expect(response.body.total).toBe(3)

      const partitions = response.body.items.map((item: any) => item.partition)
      expect(partitions).toContain("partition1")
      expect(partitions).toContain("partition2")
      expect(partitions).toContain("partition3")
    })

    it("should handle pagination correctly", async () => {
      const bondContractId = "0.0.6823801"
      const holderAccountId = "0.0.1001"
      await createBond(bondContractId)

      for (let i = 1; i <= 5; i++) {
        await bondHolderBalanceRepository.save({
          bondContractId: bondContractId,
          holderAccountId: holderAccountId,
          partition: `partition${i}`,
          availableBalance: `${i * 1000}`,
          lockedBalance: `${i * 100}`,
          heldBalance: `${i * 50}`,
          clearingBalance: `${i * 25}`,
        })
      }

      const response = await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/balances`)
        .query({ page: 2, limit: 2 })
        .expect(HttpStatus.OK)

      expect(response.body.page).toBe(2)
      expect(response.body.limit).toBe(2)
      expect(response.body.total).toBe(5)
      expect(response.body.totalPages).toBe(3)
      expect(response.body.items).toHaveLength(2)
    })

    it("should order balances by partition", async () => {
      const bondContractId = "0.0.6823801"
      const holderAccountId = "0.0.1001"
      await createBond(bondContractId)

      await bondHolderBalanceRepository.save({
        bondContractId: bondContractId,
        holderAccountId: holderAccountId,
        partition: "zzz",
        availableBalance: "1000",
        lockedBalance: "0",
        heldBalance: "0",
        clearingBalance: "0",
      })

      await bondHolderBalanceRepository.save({
        bondContractId: bondContractId,
        holderAccountId: holderAccountId,
        partition: "aaa",
        availableBalance: "2000",
        lockedBalance: "0",
        heldBalance: "0",
        clearingBalance: "0",
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/balances`)
        .query({ orderBy: "partition", order: "ASC" })
        .expect(HttpStatus.OK)

      expect(response.body.items).toHaveLength(2)
      expect(response.body.items[0].partition).toBe("aaa")
      expect(response.body.items[1].partition).toBe("zzz")
    })

    it("should validate pagination parameters", async () => {
      const bondContractId = "0.0.6823801"
      const holderAccountId = "0.0.1001"

      await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/balances`)
        .query({ page: -1 })
        .expect(HttpStatus.BAD_REQUEST)

      await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/balances`)
        .query({ limit: 0 })
        .expect(HttpStatus.BAD_REQUEST)

      await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/balances`)
        .query({ order: "INVALID" })
        .expect(HttpStatus.BAD_REQUEST)
    })

    it("should return 404 when bond does not exist", async () => {
      const bondContractId = "0.0.9999999"
      const holderAccountId = "0.0.1001"

      await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/balances`)
        .query({ page: 1, limit: 10 })
        .expect(HttpStatus.NOT_FOUND)
    })

    it("should show zero balances correctly", async () => {
      const bondContractId = "0.0.6823801"
      const holderAccountId = "0.0.1001"
      await createBond(bondContractId)

      await bondHolderBalanceRepository.save({
        bondContractId: bondContractId,
        holderAccountId: holderAccountId,
        partition: "default",
        availableBalance: "0",
        lockedBalance: "0",
        heldBalance: "0",
        clearingBalance: "0",
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/balances`)
        .query({ page: 1, limit: 10 })
        .expect(HttpStatus.OK)

      expect(response.body.items).toHaveLength(1)
      const balanceResponse = response.body.items[0]
      expect(balanceResponse.availableBalance).toBe("0")
      expect(balanceResponse.lockedBalance).toBe("0")
      expect(balanceResponse.heldBalance).toBe("0")
      expect(balanceResponse.clearingBalance).toBe("0")
    })
  })
})
