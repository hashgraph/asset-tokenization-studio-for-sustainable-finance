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
import { BondDocumentPersistence } from "@port/bond/persistence/model/BondDocumentPersistence"

describe("GetBondDocumentsHttpAdapter API Integration", () => {
  let app: INestApplication
  let container: PostgreSqlContainer
  let internalBondRepository: Repository<BondPersistence>
  let internalBondDocumentRepository: Repository<BondDocumentPersistence>

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
    internalBondDocumentRepository = app.get(getRepositoryToken(BondDocumentPersistence))
  })

  afterAll(async () => {
    await container.stop()
  })

  afterEach(async () => {
    if (app) {
      await app.close()
    }
  })

  describe("GET /:bondContractId/documents", () => {
    it("should return 404 Http error when bond is not found", async () => {
      const bondContractId = "0.0.1234567"

      await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bondContractId}/documents`)
        .send()
        .expect(HttpStatus.NOT_FOUND)
    })

    it("should return empty paginated result when bond has no documents", async () => {
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
        .get(`/api/v1/ats/bonds/${bond.contractId}/documents`)
        .send()
        .expect(HttpStatus.OK)

      expect(response.body).toEqual({
        documents: [],
      })
    })

    it("should return paginated list of documents with full details", async () => {
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

      await internalBondDocumentRepository.save({
        contractId: bond.contractId,
        name: "prospectus",
        uri: "ipfs://QmProspectusHash123",
        hash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      })

      await internalBondDocumentRepository.save({
        contractId: bond.contractId,
        name: "verification_report",
        uri: "ipfs://QmVerificationHash456",
        hash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bond.contractId}/documents`)
        .send()
        .expect(HttpStatus.OK)

      expect(response.body.documents).toHaveLength(2)

      // Sort by name to ensure consistent comparison
      const documents = response.body.documents.sort((a: any, b: any) => a.name.localeCompare(b.name))

      expect(documents[0]).toMatchObject({
        name: "prospectus",
        uri: "ipfs://QmProspectusHash123",
        hash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      })

      expect(documents[1]).toMatchObject({
        name: "verification_report",
        uri: "ipfs://QmVerificationHash456",
        hash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
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
        await internalBondDocumentRepository.save({
          contractId: bond.contractId,
          name: `document_${i}`,
          uri: `ipfs://QmDocument${i}Hash`,
          hash: `0x${i.toString().padStart(64, "0")}`,
        })
      }

      const response = await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bond.contractId}/documents?page=1&limit=2`)
        .send()
        .expect(HttpStatus.OK)

      expect(response.body.documents).toHaveLength(2)

      const response2 = await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bond.contractId}/documents?page=2&limit=2`)
        .send()
        .expect(HttpStatus.OK)

      expect(response2.body.documents).toHaveLength(2)

      const page1Names = response.body.documents.map((doc: any) => doc.name).sort()
      const page2Names = response2.body.documents.map((doc: any) => doc.name).sort()
      expect(page1Names).not.toEqual(page2Names)
    })

    it("should return documents with correct on-chain hash values", async () => {
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

      const expectedHash = "0xdeadbeefcafebabe1234567890abcdef1234567890abcdef1234567890abcdef"
      await internalBondDocumentRepository.save({
        contractId: bond.contractId,
        name: "audit_report",
        uri: "ipfs://QmAuditReportHash",
        hash: expectedHash,
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bond.contractId}/documents`)
        .send()
        .expect(HttpStatus.OK)

      expect(response.body.documents).toHaveLength(1)
      expect(response.body.documents[0].hash).toBe(expectedHash)
      expect(response.body.documents[0].name).toBe("audit_report")
      expect(response.body.documents[0].uri).toBe("ipfs://QmAuditReportHash")
    })
  })
})
