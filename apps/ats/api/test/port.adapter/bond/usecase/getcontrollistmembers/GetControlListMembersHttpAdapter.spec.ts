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
import { BondControlListMemberPersistence } from "@port/bond/persistence/model/BondControlListMemberPersistence"

describe("GetControlListMembersHttpAdapter API Integration", () => {
  let app: INestApplication
  let container: PostgreSqlContainer
  let internalBondRepository: Repository<BondPersistence>
  let internalControlListMemberRepository: Repository<BondControlListMemberPersistence>

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
    internalControlListMemberRepository = app.get(getRepositoryToken(BondControlListMemberPersistence))
  })

  afterAll(async () => {
    await container.stop()
  })

  afterEach(async () => {
    if (app) {
      await app.close()
    }
  })

  describe("GET /:bondContractId/control-list/members", () => {
    it("should return 404 Http error when bond is not found", async () => {
      const bondContractId = "0.0.1234567"

      await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bondContractId}/control-list/members`)
        .send()
        .expect(HttpStatus.NOT_FOUND)
    })

    it("should return empty paginated result when control list is empty", async () => {
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

      const response = await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bond.contractId}/control-list/members`)
        .send()
        .expect(HttpStatus.OK)

      expect(response.body.items).toEqual([])
      expect(response.body.total).toBe(0)
      expect(response.body.page).toBe(1)
    })

    it("should return paginated list of control list members", async () => {
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

      const member1 = await internalControlListMemberRepository.save({
        contractId: bond.contractId,
        holderAccountId: "0.0.5555555",
      })

      const member2 = await internalControlListMemberRepository.save({
        contractId: bond.contractId,
        holderAccountId: "0.0.6666666",
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bond.contractId}/control-list/members`)
        .send()
        .expect(HttpStatus.OK)

      expect(response.body.items).toHaveLength(2)
      expect(response.body.items[0].id).toBeDefined()
      expect(response.body.items[0].contractId).toBe(bond.contractId)
      expect(response.body.items[0].holderAccountId).toBeDefined()
      expect(response.body.items[0].createdAt).toBeDefined()
      expect(response.body.items[0].updatedAt).toBeDefined()
      expect(response.body.total).toBe(2)
    })

    it("should not return members from different bonds", async () => {
      const startingDate = new Date("2025-01-01")
      const maturityDate = new Date("2030-01-01")

      const timestamp1 = Date.now() + Math.floor(Math.random() * 100000)
      const bond1 = await internalBondRepository.save({
        contractId: `0.0.${timestamp1}`,
        treasuryId: `0.0.${timestamp1 + 1}`,
        kpiId: `0.0.${timestamp1 + 2}`,
        name: "Green Bond 1",
        symbol: "GBND1",
        decimals: 18,
        currency: "USD",
        nominalValue: "1000",
        startingDate: startingDate,
        maturityDate: maturityDate,
        maxSupply: "1000000",
        isin: "US1234567890",
      })

      const timestamp2 = Date.now() + Math.floor(Math.random() * 100000) + 1000000
      const bond2 = await internalBondRepository.save({
        contractId: `0.0.${timestamp2}`,
        treasuryId: `0.0.${timestamp2 + 1}`,
        kpiId: `0.0.${timestamp2 + 2}`,
        name: "Green Bond 2",
        symbol: "GBND2",
        decimals: 18,
        currency: "USD",
        nominalValue: "1000",
        startingDate: startingDate,
        maturityDate: maturityDate,
        maxSupply: "1000000",
        isin: "US9876543210",
      })

      await internalControlListMemberRepository.save({
        contractId: bond1.contractId,
        holderAccountId: "0.0.5555555",
      })

      await internalControlListMemberRepository.save({
        contractId: bond2.contractId,
        holderAccountId: "0.0.6666666",
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bond1.contractId}/control-list/members`)
        .send()
        .expect(HttpStatus.OK)

      expect(response.body.items).toHaveLength(1)
      expect(response.body.items[0].contractId).toBe(bond1.contractId)
      expect(response.body.items[0].holderAccountId).toBe("0.0.5555555")
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

      // Create 5 members
      for (let i = 1; i <= 5; i++) {
        await internalControlListMemberRepository.save({
          contractId: bond.contractId,
          holderAccountId: `0.0.${5555550 + i}`,
        })
      }

      // Request page 1 with limit 2
      const response1 = await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bond.contractId}/control-list/members?page=1&limit=2`)
        .send()
        .expect(HttpStatus.OK)

      expect(response1.body.items).toHaveLength(2)
      expect(response1.body.total).toBe(5)
      expect(response1.body.page).toBe(1)
      expect(response1.body.limit).toBe(2)

      // Request page 2 with limit 2
      const response2 = await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bond.contractId}/control-list/members?page=2&limit=2`)
        .send()
        .expect(HttpStatus.OK)

      expect(response2.body.items).toHaveLength(2)
      expect(response2.body.page).toBe(2)

      // Verify that different pages return different member IDs
      const page1Ids = response1.body.items.map((member: any) => member.id).sort()
      const page2Ids = response2.body.items.map((member: any) => member.id).sort()
      expect(page1Ids).not.toEqual(page2Ids)
    })

    it("should support ordering by holderAccountId", async () => {
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

      await internalControlListMemberRepository.save({
        contractId: bond.contractId,
        holderAccountId: "0.0.9999999",
      })

      await internalControlListMemberRepository.save({
        contractId: bond.contractId,
        holderAccountId: "0.0.1111111",
      })

      await internalControlListMemberRepository.save({
        contractId: bond.contractId,
        holderAccountId: "0.0.5555555",
      })

      // Request with ascending order
      const responseAsc = await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bond.contractId}/control-list/members?orderBy=holderAccountId&order=asc`)
        .send()
        .expect(HttpStatus.OK)

      expect(responseAsc.body.items).toHaveLength(3)
      expect(responseAsc.body.items[0].holderAccountId).toBe("0.0.1111111")
      expect(responseAsc.body.items[2].holderAccountId).toBe("0.0.9999999")

      // Request with descending order
      const responseDesc = await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bond.contractId}/control-list/members?orderBy=holderAccountId&order=desc`)
        .send()
        .expect(HttpStatus.OK)

      expect(responseDesc.body.items).toHaveLength(3)
      expect(responseDesc.body.items[0].holderAccountId).toBe("0.0.9999999")
      expect(responseDesc.body.items[2].holderAccountId).toBe("0.0.1111111")
    })
  })
})
