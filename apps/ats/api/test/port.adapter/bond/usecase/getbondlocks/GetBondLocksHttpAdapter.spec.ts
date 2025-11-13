// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { HttpStatus, INestApplication } from "@nestjs/common"
import request from "supertest"
import { CONTROLLERS, PROVIDERS } from "../../../../../src/Components"
import { SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "../../../../shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"
import { Repository } from "typeorm"
import { getRepositoryToken } from "@nestjs/typeorm"
import { BondPersistence } from "@port/bond/persistence/model/BondPersistence"
import { BondLockPersistence } from "@port/bond/persistence/model/BondLockPersistence"

describe("GetBondLocksHttpAdapter API Integration", () => {
  let app: INestApplication
  let container: PostgreSqlContainer
  let internalBondRepository: Repository<BondPersistence>
  let internalBondLockRepository: Repository<BondLockPersistence>

  beforeAll(async () => {
    container = await PostgreSqlContainer.create()
  })

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SharedModule, PostgresModule.forRoot(container.getConfig())],
      controllers: CONTROLLERS,
      providers: [...PROVIDERS],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.setGlobalPrefix("api/v1/ats")
    app.useLogger(false)
    await app.init()
    internalBondRepository = app.get(getRepositoryToken(BondPersistence))
    internalBondLockRepository = app.get(getRepositoryToken(BondLockPersistence))
  })

  afterAll(async () => {
    await container.stop()
  })

  afterEach(async () => {
    if (app) {
      await app.close()
    }
  })

  describe("GET /:bondContractId/holders/:holderAccountId/locks", () => {
    it("should return 404 Http error when bond is not found", async () => {
      const bondContractId = "0.0.1234567"
      const holderAccountId = "0.0.5555555"

      await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/locks`)
        .send()
        .expect(HttpStatus.NOT_FOUND)
    })

    it("should return empty paginated result when holder has no locks", async () => {
      const startingDate = new Date("2025-01-01")
      const maturityDate = new Date("2030-01-01")

      const timestamp = Date.now() + Math.floor(Math.random() * 100000)
      const bond = await internalBondRepository.save({
        contractId: `0.0.${timestamp}`,
        treasuryId: `0.0.${timestamp + 1}`,
        kpiId: `0.0.${timestamp + 2}`,
        name: "Green Bond",
        symbol: "GBND",
        decimals: 18,
        currency: "USD",
        nominalValue: "1000",
        startingDate: startingDate,
        maturityDate: maturityDate,
        maxSupply: "1000000",
        isin: "US1234567890",
      })

      const holderAccountId = "0.0.5555555"

      const response = await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bond.contractId}/holders/${holderAccountId}/locks`)
        .send()
        .expect(HttpStatus.OK)

      expect(response.body.items).toEqual([])
      expect(response.body.total).toBe(0)
      expect(response.body.page).toBe(1)
    })

    it("should return paginated list of locks for a specific holder", async () => {
      const startingDate = new Date("2025-01-01")
      const maturityDate = new Date("2030-01-01")

      const timestamp = Date.now() + Math.floor(Math.random() * 100000)
      const bond = await internalBondRepository.save({
        contractId: `0.0.${timestamp}`,
        treasuryId: `0.0.${timestamp + 1}`,
        kpiId: `0.0.${timestamp + 2}`,
        name: "Green Bond",
        symbol: "GBND",
        decimals: 18,
        currency: "USD",
        nominalValue: "1000",
        startingDate: startingDate,
        maturityDate: maturityDate,
        maxSupply: "1000000",
        isin: "US1234567890",
      })

      const holderAccountId = "0.0.5555555"
      const partition = "0x0000000000000000000000000000000000000000000000000000000000000001"
      const expirationDate = new Date("2026-01-01")

      await internalBondLockRepository.save({
        id: 1,
        contractId: bond.contractId,
        holderAccountId: holderAccountId,
        partition: partition,
        amount: "1000",
        expirationTimestamp: expirationDate,
        operatorAccountId: "0.0.123456",
      })

      await internalBondLockRepository.save({
        id: 2,
        contractId: bond.contractId,
        holderAccountId: holderAccountId,
        partition: partition,
        amount: "2000",
        expirationTimestamp: expirationDate,
        operatorAccountId: "0.0.123456",
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bond.contractId}/holders/${holderAccountId}/locks`)
        .send()
        .expect(HttpStatus.OK)

      expect(response.body.items).toHaveLength(2)
      expect(response.body.items[0].id).toBeDefined()
      expect(response.body.items[0].contractId).toBe(bond.contractId)
      expect(response.body.items[0].holderAccountId).toBe(holderAccountId)
      expect(response.body.items[0].amount).toBeDefined()
    })

    it("should not return locks for different holders", async () => {
      const startingDate = new Date("2025-01-01")
      const maturityDate = new Date("2030-01-01")

      const timestamp = Date.now() + Math.floor(Math.random() * 100000)
      const bond = await internalBondRepository.save({
        contractId: `0.0.${timestamp}`,
        treasuryId: `0.0.${timestamp + 1}`,
        kpiId: `0.0.${timestamp + 2}`,
        name: "Green Bond",
        symbol: "GBND",
        decimals: 18,
        currency: "USD",
        nominalValue: "1000",
        startingDate: startingDate,
        maturityDate: maturityDate,
        maxSupply: "1000000",
        isin: "US1234567890",
      })

      const holder1 = "0.0.5555555"
      const holder2 = "0.0.6666666"
      const partition = "0x0000000000000000000000000000000000000000000000000000000000000001"
      const expirationDate = new Date("2026-01-01")

      await internalBondLockRepository.save({
        id: 1,
        contractId: bond.contractId,
        holderAccountId: holder1,
        partition: partition,
        amount: "1000",
        expirationTimestamp: expirationDate,
        operatorAccountId: "0.0.123456",
      })

      await internalBondLockRepository.save({
        id: 2,
        contractId: bond.contractId,
        holderAccountId: holder2,
        partition: partition,
        amount: "2000",
        expirationTimestamp: expirationDate,
        operatorAccountId: "0.0.123456",
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bond.contractId}/holders/${holder1}/locks`)
        .send()
        .expect(HttpStatus.OK)

      expect(response.body.items).toHaveLength(1)
      expect(response.body.items[0].holderAccountId).toBe(holder1)
      expect(response.body.items[0].id).toBe(1)
    })

    it("should respect pagination parameters", async () => {
      const startingDate = new Date("2025-01-01")
      const maturityDate = new Date("2030-01-01")

      const timestamp = Date.now() + Math.floor(Math.random() * 100000)
      const bond = await internalBondRepository.save({
        contractId: `0.0.${timestamp}`,
        treasuryId: `0.0.${timestamp + 1}`,
        kpiId: `0.0.${timestamp + 2}`,
        name: "Green Bond",
        symbol: "GBND",
        decimals: 18,
        currency: "USD",
        nominalValue: "1000",
        startingDate: startingDate,
        maturityDate: maturityDate,
        maxSupply: "1000000",
        isin: "US1234567890",
      })

      const holderAccountId = "0.0.5555555"
      const partition = "0x0000000000000000000000000000000000000000000000000000000000000001"
      const expirationDate = new Date("2026-01-01")

      for (let i = 1; i <= 5; i++) {
        await internalBondLockRepository.save({
          id: i,
          contractId: bond.contractId,
          holderAccountId: holderAccountId,
          partition: partition,
          amount: (i * 1000).toString(),
          expirationTimestamp: expirationDate,
          operatorAccountId: "0.0.123456",
        })
      }

      // Request page 1 with limit 2
      const response = await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bond.contractId}/holders/${holderAccountId}/locks?page=1&limit=2`)
        .send()
        .expect(HttpStatus.OK)

      expect(response.body.items).toHaveLength(2)

      // Request page 2 with limit 2
      const response2 = await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bond.contractId}/holders/${holderAccountId}/locks?page=2&limit=2`)
        .send()
        .expect(HttpStatus.OK)

      expect(response2.body.items).toHaveLength(2)

      // Verify that different pages return different lock IDs
      const page1Ids = response.body.items.map((lock: any) => lock.id).sort()
      const page2Ids = response2.body.items.map((lock: any) => lock.id).sort()
      expect(page1Ids).not.toEqual(page2Ids)
    })
  })

  describe("GET /:bondContractId/holders/:holderAccountId/locks/:lockId", () => {
    it("should return 404 Http error when bond is not found", async () => {
      const bondContractId = "0.0.1234567"
      const holderAccountId = "0.0.5555555"
      const lockId = "1"

      await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/locks/${lockId}`)
        .send()
        .expect(HttpStatus.NOT_FOUND)
    })

    it("should return 404 Http error when lock is not found", async () => {
      const startingDate = new Date("2025-01-01")
      const maturityDate = new Date("2030-01-01")

      const timestamp = Date.now() + Math.floor(Math.random() * 100000)
      const bond = await internalBondRepository.save({
        contractId: `0.0.${timestamp}`,
        treasuryId: `0.0.${timestamp + 1}`,
        kpiId: `0.0.${timestamp + 2}`,
        name: "Green Bond",
        symbol: "GBND",
        decimals: 18,
        currency: "USD",
        nominalValue: "1000",
        startingDate: startingDate,
        maturityDate: maturityDate,
        maxSupply: "1000000",
        isin: "US1234567890",
      })

      const holderAccountId = "0.0.5555555"
      const lockId = "999"

      await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bond.contractId}/holders/${holderAccountId}/locks/${lockId}`)
        .send()
        .expect(HttpStatus.NOT_FOUND)
    })

    it("should return lock details when lock exists", async () => {
      const startingDate = new Date("2025-01-01")
      const maturityDate = new Date("2030-01-01")

      const timestamp = Date.now() + Math.floor(Math.random() * 100000)
      const bond = await internalBondRepository.save({
        contractId: `0.0.${timestamp}`,
        treasuryId: `0.0.${timestamp + 1}`,
        kpiId: `0.0.${timestamp + 2}`,
        name: "Green Bond",
        symbol: "GBND",
        decimals: 18,
        currency: "USD",
        nominalValue: "1000",
        startingDate: startingDate,
        maturityDate: maturityDate,
        maxSupply: "1000000",
        isin: "US1234567890",
      })

      const holderAccountId = "0.0.5555555"
      const partition = "0x0000000000000000000000000000000000000000000000000000000000000001"
      const expirationDate = new Date("2026-01-01")
      const amount = "5000"

      const lock = await internalBondLockRepository.save({
        id: 1,
        contractId: bond.contractId,
        holderAccountId: holderAccountId,
        partition: partition,
        amount: amount,
        expirationTimestamp: expirationDate,
        operatorAccountId: "0.0.123456",
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bond.contractId}/holders/${holderAccountId}/locks/${lock.id}`)
        .send()
        .expect(HttpStatus.OK)

      expect(response.body.id).toBe(lock.id)
      expect(response.body.contractId).toBe(bond.contractId)
      expect(response.body.holderAccountId).toBe(holderAccountId)
      expect(response.body.partition).toBe(partition)
      expect(response.body.amount).toBe(amount)
      expect(response.body.operatorAccountId).toBe("0.0.123456")
    })

    it("should return 404 when requesting lock of different holder", async () => {
      const startingDate = new Date("2025-01-01")
      const maturityDate = new Date("2030-01-01")

      const timestamp = Date.now() + Math.floor(Math.random() * 100000)
      const bond = await internalBondRepository.save({
        contractId: `0.0.${timestamp}`,
        treasuryId: `0.0.${timestamp + 1}`,
        kpiId: `0.0.${timestamp + 2}`,
        name: "Green Bond",
        symbol: "GBND",
        decimals: 18,
        currency: "USD",
        nominalValue: "1000",
        startingDate: startingDate,
        maturityDate: maturityDate,
        maxSupply: "1000000",
        isin: "US1234567890",
      })

      const holder1 = "0.0.5555555"
      const holder2 = "0.0.6666666"
      const partition = "0x0000000000000000000000000000000000000000000000000000000000000001"
      const expirationDate = new Date("2026-01-01")

      const lock = await internalBondLockRepository.save({
        id: 1,
        contractId: bond.contractId,
        holderAccountId: holder1,
        partition: partition,
        amount: "1000",
        expirationTimestamp: expirationDate,
        operatorAccountId: "0.0.123456",
      })

      // Try to access holder1's lock with holder2 in the URL
      await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bond.contractId}/holders/${holder2}/locks/${lock.id}`)
        .send()
        .expect(HttpStatus.NOT_FOUND)
    })

    it("should return 400 for invalid lockId format", async () => {
      const bondContractId = "0.0.1234567"
      const holderAccountId = "0.0.5555555"
      const invalidLockId = "invalid"

      await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/locks/${invalidLockId}`)
        .send()
        .expect(HttpStatus.BAD_REQUEST)
    })
  })
})
