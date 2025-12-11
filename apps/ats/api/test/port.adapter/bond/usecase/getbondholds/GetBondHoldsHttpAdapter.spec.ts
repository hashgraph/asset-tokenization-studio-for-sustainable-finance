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
import { BondPersistence } from "@port/bond/persistence/model/BondPersistence"
import { BondHoldPersistence } from "@port/hold/persistence/model/BondHoldPersistence"

describe("GetBondHoldsHttpAdapter API Integration", () => {
  let app: INestApplication
  let bondRepository: Repository<BondPersistence>
  let bondHoldRepository: Repository<BondHoldPersistence>
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
    bondRepository = app.get(getRepositoryToken(BondPersistence))
    bondHoldRepository = app.get(getRepositoryToken(BondHoldPersistence))
  })
  afterEach(async () => {
    if (bondHoldRepository) {
      await bondHoldRepository.query('DELETE FROM "Bonds"')
    }
    if (bondRepository) {
      await bondRepository.query('DELETE FROM "Bonds"')
    }
    if (app) {
      await app.close()
    }
  })

  describe("GET /:bondContractId/holders/:holderAccountId/holds", () => {
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

    it("should return 404 when bond does not exist", async () => {
      const bondContractId = "0.0.9999999"
      const holderAccountId = "0.0.1001"

      await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/holds`)
        .query({ page: 1, limit: 10 })
        .expect(HttpStatus.NOT_FOUND)
    })

    it("should return empty page when holder has no holds", async () => {
      const bondContractId = "0.0.6823801"
      const holderAccountId = "0.0.1001"
      await createBond(bondContractId)

      const response = await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/holds`)
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

    it("should return holder holds with complete data", async () => {
      const bondContractId = "0.0.6823801"
      const holderAccountId = "0.0.1001"
      await createBond(bondContractId)

      const expirationTimestamp = new Date("2026-06-01")
      const hold = await bondHoldRepository.save({
        id: 1,
        bondContractId: bondContractId,
        holderAccountId: holderAccountId,
        partition: "default",
        amount: "1000",
        expirationTimestamp: expirationTimestamp,
        escrowAccountId: "0.0.2001",
        toAccountId: "0.0.3001",
        data: "hold data",
        operatorData: "operator data",
        operatorAccountId: "0.0.4001",
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/holds`)
        .query({ page: 1, limit: 10 })
        .expect(HttpStatus.OK)

      expect(response.body.items).toHaveLength(1)
      expect(response.body.total).toBe(1)
      expect(response.body.page).toBe(1)
      expect(response.body.limit).toBe(10)
      expect(response.body.totalPages).toBe(1)

      const holdResponse = response.body.items[0]
      expect(holdResponse).toMatchObject({
        id: hold.id,
        bondContractId: hold.bondContractId,
        holderAccountId: hold.holderAccountId,
        partition: hold.partition,
        amount: hold.amount,
        escrowAccountId: hold.escrowAccountId,
        toAccountId: hold.toAccountId,
        data: hold.data,
        operatorData: hold.operatorData,
        operatorAccountId: hold.operatorAccountId,
      })
      expect(new Date(holdResponse.expirationTimestamp).toISOString()).toBe(expirationTimestamp.toISOString())
    })

    it("should filter holds by bondContractId and holderAccountId", async () => {
      const bondContractId1 = "0.0.6823801"
      const bondContractId2 = "0.0.6823802"
      const holderAccountId1 = "0.0.1001"
      const holderAccountId2 = "0.0.1002"
      await createBond(bondContractId1)
      await createBond(bondContractId2)

      const expirationTimestamp = new Date("2026-06-01")
      await bondHoldRepository.save([
        {
          id: 1,
          bondContractId: bondContractId1,
          holderAccountId: holderAccountId1,
          partition: "partition1",
          amount: "1000",
          expirationTimestamp: expirationTimestamp,
          escrowAccountId: "0.0.2001",
          toAccountId: "0.0.3001",
          data: "",
          operatorData: "",
          operatorAccountId: "",
        },
        {
          id: 2,
          bondContractId: bondContractId1,
          holderAccountId: holderAccountId1,
          partition: "partition2",
          amount: "2000",
          expirationTimestamp: expirationTimestamp,
          escrowAccountId: "0.0.2001",
          toAccountId: "0.0.3001",
          data: "",
          operatorData: "",
          operatorAccountId: "",
        },
        {
          id: 3,
          bondContractId: bondContractId1,
          holderAccountId: holderAccountId2,
          partition: "default",
          amount: "3000",
          expirationTimestamp: expirationTimestamp,
          escrowAccountId: "0.0.2001",
          toAccountId: "0.0.3001",
          data: "",
          operatorData: "",
          operatorAccountId: "",
        },
        {
          id: 4,
          bondContractId: bondContractId2,
          holderAccountId: holderAccountId1,
          partition: "default",
          amount: "4000",
          expirationTimestamp: expirationTimestamp,
          escrowAccountId: "0.0.2001",
          toAccountId: "0.0.3001",
          data: "",
          operatorData: "",
          operatorAccountId: "",
        },
      ])

      const response = await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bondContractId1}/holders/${holderAccountId1}/holds`)
        .query({ page: 1, limit: 10 })
        .expect(HttpStatus.OK)

      expect(response.body.items).toHaveLength(2)
      expect(response.body.total).toBe(2)
      expect(response.body.items.every((item: any) => item.bondContractId === bondContractId1)).toBe(true)
      expect(response.body.items.every((item: any) => item.holderAccountId === holderAccountId1)).toBe(true)
    })

    it("should return multiple holds for the same holder", async () => {
      const bondContractId = "0.0.6823801"
      const holderAccountId = "0.0.1001"
      await createBond(bondContractId)

      const expirationTimestamp = new Date("2026-06-01")
      await bondHoldRepository.save([
        {
          id: 1,
          bondContractId: bondContractId,
          holderAccountId: holderAccountId,
          partition: "partition1",
          amount: "1000",
          expirationTimestamp: expirationTimestamp,
          escrowAccountId: "0.0.2001",
          toAccountId: "0.0.3001",
          data: "data1",
          operatorData: "",
          operatorAccountId: "",
        },
        {
          id: 2,
          bondContractId: bondContractId,
          holderAccountId: holderAccountId,
          partition: "partition2",
          amount: "2000",
          expirationTimestamp: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          escrowAccountId: "0.0.2002",
          toAccountId: "0.0.3002",
          data: "data2",
          operatorData: "",
          operatorAccountId: "",
        },
        {
          id: 3,
          bondContractId: bondContractId,
          holderAccountId: holderAccountId,
          partition: "partition3",
          amount: "3000",
          expirationTimestamp: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          escrowAccountId: "0.0.2003",
          toAccountId: "0.0.3003",
          data: "data3",
          operatorData: "",
          operatorAccountId: "",
        },
      ])

      const response = await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/holds`)
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

      const expirationTimestamp = new Date("2026-06-01")
      for (let i = 1; i <= 5; i++) {
        await bondHoldRepository.save({
          id: i,
          bondContractId: bondContractId,
          holderAccountId: holderAccountId,
          partition: `partition${i}`,
          amount: `${i * 1000}`,
          expirationTimestamp: expirationTimestamp,
          escrowAccountId: `0.0.${2000 + i}`,
          toAccountId: `0.0.${3000 + i}`,
          data: `data${i}`,
          operatorData: "",
          operatorAccountId: "",
        })
      }

      // Request page 1 with limit 2
      const response1 = await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/holds`)
        .query({ page: 1, limit: 2 })
        .expect(HttpStatus.OK)

      expect(response1.body.page).toBe(1)
      expect(response1.body.limit).toBe(2)
      expect(response1.body.total).toBe(5)
      expect(response1.body.totalPages).toBe(3)
      expect(response1.body.items).toHaveLength(2)

      // Request page 2 with limit 2
      const response2 = await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/holds`)
        .query({ page: 2, limit: 2 })
        .expect(HttpStatus.OK)

      expect(response2.body.page).toBe(2)
      expect(response2.body.limit).toBe(2)
      expect(response2.body.total).toBe(5)
      expect(response2.body.items).toHaveLength(2)

      // Verify that different pages return different hold IDs
      const page1Ids = response1.body.items.map((hold: any) => hold.id).sort()
      const page2Ids = response2.body.items.map((hold: any) => hold.id).sort()
      expect(page1Ids).not.toEqual(page2Ids)
    })

    it("should order holds by createdAt DESC", async () => {
      const bondContractId = "0.0.6823801"
      const holderAccountId = "0.0.1001"
      await createBond(bondContractId)

      const expirationTimestamp = new Date("2026-06-01")

      // Save in specific order to control createdAt
      const hold1 = await bondHoldRepository.save({
        id: 1,
        bondContractId: bondContractId,
        holderAccountId: holderAccountId,
        partition: "first",
        amount: "1000",
        expirationTimestamp: expirationTimestamp,
        escrowAccountId: "0.0.2001",
        toAccountId: "0.0.3001",
        data: "first",
        operatorData: "",
        operatorAccountId: "",
      })

      // Wait a bit to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 10))

      const hold2 = await bondHoldRepository.save({
        id: 2,
        bondContractId: bondContractId,
        holderAccountId: holderAccountId,
        partition: "second",
        amount: "2000",
        expirationTimestamp: expirationTimestamp,
        escrowAccountId: "0.0.2002",
        toAccountId: "0.0.3002",
        data: "second",
        operatorData: "",
        operatorAccountId: "",
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/holds`)
        .query({ page: 1, limit: 10 })
        .expect(HttpStatus.OK)

      expect(response.body.items).toHaveLength(2)
      // Most recent should be first
      expect(response.body.items[0].id).toBe(hold2.id)
      expect(response.body.items[1].id).toBe(hold1.id)
    })

    it("should handle holds with empty optional fields", async () => {
      const bondContractId = "0.0.6823801"
      const holderAccountId = "0.0.1001"
      await createBond(bondContractId)

      await bondHoldRepository.save({
        id: 1,
        bondContractId: bondContractId,
        holderAccountId: holderAccountId,
        partition: "default",
        amount: "1000",
        expirationTimestamp: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        escrowAccountId: "0.0.2001",
        toAccountId: "0.0.3001",
        data: "",
        operatorData: "",
        operatorAccountId: "",
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/holds`)
        .query({ page: 1, limit: 10 })
        .expect(HttpStatus.OK)

      expect(response.body.items).toHaveLength(1)
      const holdResponse = response.body.items[0]
      expect(holdResponse.data).toBe("")
      expect(holdResponse.operatorData).toBe("")
      expect(holdResponse.operatorAccountId).toBe("")
    })

    it("should validate pagination parameters", async () => {
      const bondContractId = "0.0.6823801"
      const holderAccountId = "0.0.1001"

      await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/holds`)
        .query({ page: -1 })
        .expect(HttpStatus.BAD_REQUEST)

      await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/holds`)
        .query({ limit: 0 })
        .expect(HttpStatus.BAD_REQUEST)

      await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/holds`)
        .query({ order: "INVALID" })
        .expect(HttpStatus.BAD_REQUEST)
    })
  })
})
