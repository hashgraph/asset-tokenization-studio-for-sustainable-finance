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
import { BondDocumentPersistence } from "@port/document/persistence/model/BondDocumentPersistence"
import { DocumentRemovedDLTEvent } from "@port/document/usecase/removebonddocument/model/DocumentRemovedDLTEvent"

describe("RemoveBondDocumentNestJSEventAdapter Integration", () => {
  const CONTRACT_ID = "0.0.6974684"

  let app: INestApplication
  let eventBus: EventBus
  let bondRepository: Repository<BondPersistence>
  let bondDocumentRepository: Repository<BondDocumentPersistence>
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SharedModule, PostgresModule.forRoot(PostgreSqlContainer.getWorkerConfig())],
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
      name: "Green Bond",
      symbol: "GBND",
      decimals: 18,
      currency: "USD",
      nominalValue: "1000",
      nominalValueDecimals: 2,
      startingDate: new Date("2025-01-01"),
      maturityDate: new Date("2025-01-01"),
      maxSupply: "1000000",
      isin: "US1234567890",
    })
  })
  afterEach(async () => {
    await bondRepository.query('DELETE FROM "Bonds"')
    await bondDocumentRepository.query('DELETE FROM "Bonds"')
    await app.close()
  })

  describe("RemoveBondDocumentNestJSEventAdapter", () => {
    it("should delete bond document when DocumentRemovedDLTEvent is published", async () => {
      const documentName = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"

      const bondDocument = Object.assign(new BondDocumentPersistence(), {
        bondContractId: CONTRACT_ID,
        name: documentName,
        uri: "document-uri",
        hash: "0xhash",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      await bondDocumentRepository.save(bondDocument)

      const event = new DocumentRemovedDLTEvent(
        CONTRACT_ID,
        "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
        documentName,
        "document-uri",
        "0xhash",
      )

      await eventBus.publishSync(event, DocumentRemovedDLTEvent.name)

      const removedBondDocument = await bondDocumentRepository.findOne({
        where: { bondContractId: CONTRACT_ID, name: documentName },
      })

      expect(removedBondDocument).toBeNull()
    })

    it("should not find deleted document in queries", async () => {
      const documentName = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"

      const bondDocument = Object.assign(new BondDocumentPersistence(), {
        bondContractId: CONTRACT_ID,
        name: documentName,
        uri: "document-uri",
        hash: "0xhash",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      await bondDocumentRepository.save(bondDocument)

      const event = new DocumentRemovedDLTEvent(
        CONTRACT_ID,
        "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
        documentName,
        "document-uri",
        "0xhash",
      )

      await eventBus.publishSync(event, DocumentRemovedDLTEvent.name)

      const regularQuery = await bondDocumentRepository.findOne({
        where: { bondContractId: CONTRACT_ID, name: documentName },
      })

      expect(regularQuery).toBeNull()
    })

    it("should throw error when trying to remove non-existent document", async () => {
      const documentName = "0xnonexistent000000000000000000000000000000000000000000000000000"

      const event = new DocumentRemovedDLTEvent(
        CONTRACT_ID,
        "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
        documentName,
        "document-uri",
        "0xhash",
      )

      await expect(eventBus.publishSync(event, DocumentRemovedDLTEvent.name)).rejects.toThrow(
        `Bond document with name ${documentName} not found for contract ${CONTRACT_ID}`,
      )
    })

    it("should throw error when trying to remove non-existent document (already deleted)", async () => {
      const documentName = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"

      const event = new DocumentRemovedDLTEvent(
        CONTRACT_ID,
        "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
        documentName,
        "document-uri",
        "0xhash",
      )

      await expect(eventBus.publishSync(event, DocumentRemovedDLTEvent.name)).rejects.toThrow(
        `Bond document with name ${documentName} not found for contract ${CONTRACT_ID}`,
      )
    })

    it("should publish BondDocumentRemovedEvent after successful removal", async () => {
      const documentName = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"

      const bondDocument = Object.assign(new BondDocumentPersistence(), {
        bondContractId: CONTRACT_ID,
        name: documentName,
        uri: "document-uri",
        hash: "0xhash",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      await bondDocumentRepository.save(bondDocument)

      let publishedEvent: any
      jest.spyOn(eventBus, "publish").mockImplementation((event) => (publishedEvent = event))

      const event = new DocumentRemovedDLTEvent(
        CONTRACT_ID,
        "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
        documentName,
        "document-uri",
        "0xhash",
      )

      await eventBus.publishSync(event, DocumentRemovedDLTEvent.name)

      expect(publishedEvent).toEqual(
        expect.objectContaining({
          name: documentName,
          bondContractId: CONTRACT_ID,
        }),
      )
    })

    it("should be able to remove multiple documents independently", async () => {
      const documentNames = [
        "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaabbb",
        "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaccc",
      ]

      for (const name of documentNames) {
        const bondDocument = Object.assign(new BondDocumentPersistence(), {
          bondContractId: CONTRACT_ID,
          name: name,
          uri: "document-uri",
          hash: "0xhash",
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        await bondDocumentRepository.save(bondDocument)
      }

      const event = new DocumentRemovedDLTEvent(
        CONTRACT_ID,
        "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
        documentNames[0],
        "document-uri",
        "0xhash",
      )

      await eventBus.publishSync(event, DocumentRemovedDLTEvent.name)

      const allDocuments = await bondDocumentRepository.find({
        where: { bondContractId: CONTRACT_ID },
      })

      expect(allDocuments).toHaveLength(2)
      expect(allDocuments.map((d) => d.name)).toContain(documentNames[1])
      expect(allDocuments.map((d) => d.name)).toContain(documentNames[2])
      expect(allDocuments.map((d) => d.name)).not.toContain(documentNames[0])
    })
  })
})
