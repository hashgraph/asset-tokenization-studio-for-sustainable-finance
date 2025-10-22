// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import { CONTROLLERS, PROVIDERS } from "@components"
import { EventBus, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "@test/shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"
import { Repository } from "typeorm"
import { BondPersistence } from "@port/bond/persistence/model/BondPersistence"
import { getRepositoryToken } from "@nestjs/typeorm"
import { BondDocumentPersistence } from "@port/bond/persistence/model/BondDocumentPersistence"
import { DocumentUpdatedDLTEvent } from "@port/bond/usecase/setbonddocument/model/DocumentUpdatedDLTEvent"

describe("SetBondDocumentNestJSEventAdapter Integration", () => {
  const CONTRACT_ID = "0.0.6974684"

  let app: INestApplication
  let container: PostgreSqlContainer
  let eventBus: EventBus
  let bondRepository: Repository<BondPersistence>
  let bondDocumentRepository: Repository<BondDocumentPersistence>

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
    await app.init()
    eventBus = app.get("EventBus")
    bondRepository = app.get(getRepositoryToken(BondPersistence))
    bondDocumentRepository = app.get(getRepositoryToken(BondDocumentPersistence))

    await bondRepository.save({
      contractId: CONTRACT_ID,
      treasuryId: "0.0.6823801",
      kpiId: "0.0.6823801",
      name: "Green Bond",
      symbol: "GBND",
      decimals: 18,
      currency: "USD",
      nominalValue: "1000",
      startingDate: new Date("2025-01-01"),
      maturityDate: new Date("2025-01-01"),
      maxSupply: "1000000",
      isin: "US1234567890",
    })
  })

  afterAll(async () => {
    await container.stop()
  })

  afterEach(async () => {
    await bondRepository.clear()
    await bondDocumentRepository.clear()
    await app.close()
  })

  describe("SetBondDocumentNestJSEventAdapter", () => {
    it("should create a new bond document when DocumentUpdatedDLTEvent is published", async () => {
      const documentName = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
      const event = new DocumentUpdatedDLTEvent(
        CONTRACT_ID,
        "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
        documentName,
        "document-uri",
        "document-hash",
      )

      await eventBus.publishSync(event, DocumentUpdatedDLTEvent.name)

      const savedBondDocument = await bondDocumentRepository.findOne({
        where: { contractId: CONTRACT_ID, name: documentName },
      })

      expect(savedBondDocument).toBeDefined()
      expect(savedBondDocument).not.toBeNull()
      expect(savedBondDocument!.contractId).toBe("0.0.6974684")
      expect(savedBondDocument!.name).toBe(documentName)
      expect(savedBondDocument!.uri).toBe(event._uri)
      expect(savedBondDocument!.hash).toBe(event._documentHash)
    })

    it("should update the bond document when DocumentUpdatedDLTEvent is published and a document with same name and contractId exists", async () => {
      const documentName = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
      const bondDocument = Object.assign(new BondDocumentPersistence(), {
        contractId: CONTRACT_ID,
        name: documentName,
        uri: "document-uri",
        hash: "0x",
        format: "hedera",
        accountId: "0.0.6823801",
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        deletedBy: null,
      })
      await bondDocumentRepository.save(bondDocument)

      const newHash = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaabbb"
      const newUri = "newDocumentUri"
      const event = new DocumentUpdatedDLTEvent(
        CONTRACT_ID,
        "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
        documentName,
        newUri,
        newHash,
      )

      await eventBus.publishSync(event, DocumentUpdatedDLTEvent.name)

      const savedBondDocument = await bondDocumentRepository.findOne({
        where: { contractId: CONTRACT_ID, name: documentName },
      })

      expect(savedBondDocument).toBeDefined()
      expect(savedBondDocument).not.toBeNull()
      expect(savedBondDocument!.contractId).toBe(CONTRACT_ID)
      expect(savedBondDocument!.name).toBe(documentName)
      expect(savedBondDocument!.uri).toBe(newUri)
      expect(savedBondDocument!.hash).toBe(newHash)
    })

    it("should create bond documents with different names successfully", async () => {
      const documentNames = [
        "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaabbb",
        "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaccc",
      ]

      for (const name of documentNames) {
        const event = new DocumentUpdatedDLTEvent(
          CONTRACT_ID,
          "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
          name,
          "document-uri",
          "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaccc",
        )

        await eventBus.publishSync(event, DocumentUpdatedDLTEvent.name)

        const savedBondDocument = await bondDocumentRepository.findOne({
          where: { contractId: CONTRACT_ID, name: name },
        })

        expect(savedBondDocument).toBeDefined()
        expect(savedBondDocument).not.toBeNull()
        expect(savedBondDocument!.contractId).toBe(CONTRACT_ID)
        expect(savedBondDocument!.name).toBe(name)
      }
      const allDocuments = await bondDocumentRepository.find()
      expect(allDocuments).toHaveLength(documentNames.length)
    })

    it("should publish BondDocumentSetEvent after successful bond document creation", async () => {
      let publishedEvent: any
      jest.spyOn(eventBus, "publish").mockImplementation((event) => (publishedEvent = event))

      const event = new DocumentUpdatedDLTEvent(
        CONTRACT_ID,
        "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
        "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaccc",
        "document-uri",
        "d0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaccc",
      )

      await eventBus.publishSync(event, DocumentUpdatedDLTEvent.name)

      expect(publishedEvent).toEqual(
        expect.objectContaining({
          name: event._name,
          contractId: CONTRACT_ID,
          uri: event._uri,
          hash: event._documentHash,
        }),
      )
    })
  })
})
