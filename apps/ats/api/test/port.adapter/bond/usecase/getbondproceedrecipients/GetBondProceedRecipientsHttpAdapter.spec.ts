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
import { BondProceedRecipientPersistence } from "@port/bond/persistence/model/BondProceedRecipientPersistence"

describe("GetBondProceedRecipientsHttpAdapter API Integration", () => {
  let app: INestApplication
  let container: PostgreSqlContainer
  let internalBondRepository: Repository<BondPersistence>
  let internalBondProceedRecipientRepository: Repository<BondProceedRecipientPersistence>

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
    internalBondProceedRecipientRepository = app.get(getRepositoryToken(BondProceedRecipientPersistence))
  })

  afterAll(async () => {
    await container.stop()
  })

  afterEach(async () => {
    if (app) {
      await app.close()
    }
  })

  describe("GET /:bondContractId/proceeds-recipients", () => {
    it("should return 404 Http error when bond is not found", async () => {
      const bondContractId = "0.0.1234567"

      await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bondContractId}/proceeds-recipients`)
        .send()
        .expect(HttpStatus.NOT_FOUND)
    })

    it("should return empty paginated result when bond has no proceed recipients", async () => {
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
        .get(`/api/v1/ats/bonds/${bond.contractId}/proceeds-recipients`)
        .send()
        .expect(HttpStatus.OK)

      expect(response.body.items).toEqual([])
      expect(response.body.total).toBe(0)
    })

    it("should return paginated list of proceed recipient addresses", async () => {
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

      const recipient1 = "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7"
      const recipient2 = "0x48ca774f6942166bf37e178ccc1e861947ead8c7"

      await internalBondProceedRecipientRepository.save({
        contractId: bond.contractId,
        proceedRecipientAddress: recipient1,
        data: "0x",
      })

      await internalBondProceedRecipientRepository.save({
        contractId: bond.contractId,
        proceedRecipientAddress: recipient2,
        data: "0x1234",
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bond.contractId}/proceeds-recipients`)
        .send()
        .expect(HttpStatus.OK)

      expect(response.body.items).toHaveLength(2)
      expect(response.body.total).toBe(2)
      expect(response.body.page).toBe(1)

      const addresses = response.body.items.map((item: any) => item.proceedRecipientAddress).sort()
      expect(addresses).toEqual([recipient2, recipient1].sort())

      // Verify full object structure
      response.body.items.forEach((item: any) => {
        expect(item).toHaveProperty("id")
        expect(item).toHaveProperty("contractId", bond.contractId)
        expect(item).toHaveProperty("proceedRecipientAddress")
        expect(item).toHaveProperty("data")
        expect(item).toHaveProperty("createdAt")
        expect(item).toHaveProperty("updatedAt")
      })
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

      for (let i = 1; i <= 5; i++) {
        await internalBondProceedRecipientRepository.save({
          contractId: bond.contractId,
          proceedRecipientAddress: `0x${i.toString().padStart(40, "0")}`,
          data: "0x",
        })
      }

      // This requests page 1 with limit 2
      const response = await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bond.contractId}/proceeds-recipients?page=1&limit=2`)
        .send()
        .expect(HttpStatus.OK)

      expect(response.body.items).toHaveLength(2)
      expect(response.body.total).toBe(5)
      expect(response.body.page).toBe(1)
      expect(response.body.limit).toBe(2)

      // This requests page 2 with limit 2
      const response2 = await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bond.contractId}/proceeds-recipients?page=2&limit=2`)
        .send()
        .expect(HttpStatus.OK)

      expect(response2.body.items).toHaveLength(2)
      expect(response2.body.total).toBe(5)
      expect(response2.body.page).toBe(2)

      // Verify that different pages return different addresses
      const page1Addresses = response.body.items.map((item: any) => item.proceedRecipientAddress).sort()
      const page2Addresses = response2.body.items.map((item: any) => item.proceedRecipientAddress).sort()
      expect(page1Addresses).not.toEqual(page2Addresses)
    })
  })
})
