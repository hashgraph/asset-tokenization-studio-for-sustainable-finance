// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import { CONTROLLERS, PROVIDERS } from "@components"
import { EventBus, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "@test/shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"
import { Repository } from "typeorm"
import { BondProceedRecipientPersistence } from "@port/proceedrecipient/persistence/model/BondProceedRecipientPersistence"
import { getRepositoryToken } from "@nestjs/typeorm"
import { ProceedRecipientAddedDLTEvent } from "@port/proceedrecipient/usecase/addproceedrecipient/model/ProceedRecipientAddedDLTEvent"
import { BondNotFoundError } from "@domain/bond/errors/BondNotFoundError"
import { BondPersistence } from "@port/bond/persistence/model/BondPersistence"
import { BondProceedRecipientFoundError } from "@domain/proceedrecipient/errors/BondProceedRecipientFoundError"

describe("AddProceedRecipientNestJSEventAdapter Integration", () => {
  const CONTRACT_ID = "0.0.6974684"
  let app: INestApplication
  let container: PostgreSqlContainer
  let eventBus: EventBus
  let bondProceedRecipientRepository: Repository<BondProceedRecipientPersistence>
  let bondRepository: Repository<BondPersistence>

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
    bondProceedRecipientRepository = app.get(getRepositoryToken(BondProceedRecipientPersistence))
    bondRepository = app.get(getRepositoryToken(BondPersistence))
  })

  afterAll(async () => {
    await container.stop()
  })

  afterEach(async () => {
    await bondProceedRecipientRepository.clear()
    await bondRepository.clear()
    await app.close()
  })

  describe("AddProceedRecipientNestJSEventAdapter", () => {
    it("should add a new proceed recipient when ProceedRecipientAddedDLTEvent is published", async () => {
      await bondRepository.save({
        contractId: CONTRACT_ID,
        treasuryId: "0.0.6823801",
        kpiId: "0.0.6974684",
        name: "Test Bond",
        symbol: "TB",
        decimals: 18,
        currency: "USD",
        nominalValue: "100",
        nominalValueDecimals: 2,
        startingDate: new Date("2025-01-01"),
        maturityDate: new Date("2030-01-01"),
        maxSupply: "1000000",
        isin: "US1234567890",
      })

      const event = new ProceedRecipientAddedDLTEvent(
        CONTRACT_ID,
        "0x1234567890abcdef",
        "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
        "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
        "0x",
      )

      await eventBus.publishSync(event, ProceedRecipientAddedDLTEvent.name)

      const savedRecipient = await bondProceedRecipientRepository.findOne({
        where: { contractId: CONTRACT_ID, proceedRecipientAddress: "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7" },
      })

      expect(savedRecipient).toBeDefined()
      expect(savedRecipient).not.toBeNull()
      expect(savedRecipient!.contractId).toBe(CONTRACT_ID)
      expect(savedRecipient!.proceedRecipientAddress).toBe("0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7")
      expect(savedRecipient!.data).toBe("0x")
    })

    it("should add a proceed recipient with custom data successfully", async () => {
      await bondRepository.save({
        contractId: CONTRACT_ID,
        treasuryId: "0.0.6823801",
        kpiId: "0.0.6974684",
        name: "Test Bond",
        symbol: "TB",
        decimals: 18,
        currency: "USD",
        nominalValue: "100",
        nominalValueDecimals: 2,
        startingDate: new Date("2025-01-01"),
        maturityDate: new Date("2030-01-01"),
        maxSupply: "1000000",
        isin: "US1234567890",
      })

      const customData = "0x1234567890abcdef"
      const event = new ProceedRecipientAddedDLTEvent(
        CONTRACT_ID,
        "0x1234567890abcdef",
        "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
        "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
        customData,
      )

      await eventBus.publishSync(event, ProceedRecipientAddedDLTEvent.name)

      const savedRecipient = await bondProceedRecipientRepository.findOne({
        where: { contractId: CONTRACT_ID, proceedRecipientAddress: "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7" },
      })

      expect(savedRecipient).toBeDefined()
      expect(savedRecipient).not.toBeNull()
      expect(savedRecipient!.data).toBe(customData)
    })

    it("should throw BondProceedRecipientFoundError when recipient with same contractId and address already exists", async () => {
      await bondRepository.save({
        contractId: CONTRACT_ID,
        treasuryId: "0.0.6823801",
        kpiId: "0.0.6974684",
        name: "Test Bond",
        symbol: "TB",
        decimals: 18,
        currency: "USD",
        nominalValue: "100",
        nominalValueDecimals: 2,
        startingDate: new Date("2025-01-01"),
        maturityDate: new Date("2030-01-01"),
        maxSupply: "1000000",
        isin: "US1234567890",
      })

      const existingRecipient = {
        contractId: CONTRACT_ID,
        proceedRecipientAddress: "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
        data: "0x",
      }

      await bondProceedRecipientRepository.save(existingRecipient)

      const event = new ProceedRecipientAddedDLTEvent(
        CONTRACT_ID,
        "0x1234567890abcdef",
        "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
        "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
        "0x",
      )

      await expect(eventBus.publishSync(event, ProceedRecipientAddedDLTEvent.name)).rejects.toThrow(
        BondProceedRecipientFoundError.contractIdAndProceedRecipientAddressError(
          CONTRACT_ID,
          "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
        ),
      )
    })

    it("should add multiple proceed recipients for different addresses successfully", async () => {
      await bondRepository.save({
        contractId: CONTRACT_ID,
        treasuryId: "0.0.6823801",
        kpiId: "0.0.6974684",
        name: "Test Bond",
        symbol: "TB",
        decimals: 18,
        currency: "USD",
        nominalValue: "100",
        nominalValueDecimals: 2,
        startingDate: new Date("2025-01-01"),
        maturityDate: new Date("2030-01-01"),
        maxSupply: "1000000",
        isin: "US1234567890",
      })

      const recipients = ["0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7", "0x48ca774f6942166bf37e178ccc1e861947ead8c7"]

      for (const recipient of recipients) {
        const event = new ProceedRecipientAddedDLTEvent(
          CONTRACT_ID,
          "0x1234567890abcdef",
          "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
          recipient,
          "0x",
        )

        await eventBus.publishSync(event, ProceedRecipientAddedDLTEvent.name)

        const savedRecipient = await bondProceedRecipientRepository.findOne({
          where: { contractId: CONTRACT_ID, proceedRecipientAddress: recipient },
        })

        expect(savedRecipient).toBeDefined()
        expect(savedRecipient).not.toBeNull()
        expect(savedRecipient!.contractId).toBe(CONTRACT_ID)
        expect(savedRecipient!.proceedRecipientAddress).toBe(recipient)
      }

      const allRecipients = await bondProceedRecipientRepository.find()
      expect(allRecipients).toHaveLength(recipients.length)
    })

    it("should add proceed recipients for different bonds successfully", async () => {
      const contracts = ["0.0.6974684", "0.0.6974685"]
      for (const contractId of contracts) {
        await bondRepository.save({
          contractId,
          treasuryId: contractId,
          kpiId: contractId,
          name: `Test Bond ${contractId}`,
          symbol: "TB",
          decimals: 18,
          currency: "USD",
          nominalValue: "100",
          nominalValueDecimals: 2,
          startingDate: new Date("2025-01-01"),
          maturityDate: new Date("2030-01-01"),
          maxSupply: "1000000",
          isin: "US1234567890",
        })
      }

      const proceedRecipientAddress = "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7"

      for (const contractId of contracts) {
        const event = new ProceedRecipientAddedDLTEvent(
          contractId,
          "0x1234567890abcdef",
          "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
          proceedRecipientAddress,
          "0x",
        )

        await eventBus.publishSync(event, ProceedRecipientAddedDLTEvent.name)

        const savedRecipient = await bondProceedRecipientRepository.findOne({
          where: { contractId, proceedRecipientAddress },
        })

        expect(savedRecipient).toBeDefined()
        expect(savedRecipient).not.toBeNull()
        expect(savedRecipient!.contractId).toBe(contractId)
        expect(savedRecipient!.proceedRecipientAddress).toBe(proceedRecipientAddress)
      }

      const allRecipients = await bondProceedRecipientRepository.find()
      expect(allRecipients).toHaveLength(contracts.length)
    })

    it("should publish BondProceedRecipientAddedEvent after successful recipient creation", async () => {
      await bondRepository.save({
        contractId: CONTRACT_ID,
        treasuryId: "0.0.6823801",
        kpiId: "0.0.6974684",
        name: "Test Bond",
        symbol: "TB",
        decimals: 18,
        currency: "USD",
        nominalValue: "100",
        nominalValueDecimals: 2,
        startingDate: new Date("2025-01-01"),
        maturityDate: new Date("2030-01-01"),
        maxSupply: "1000000",
        isin: "US1234567890",
      })

      let publishedEvent: any
      jest.spyOn(eventBus, "publish").mockImplementation((event) => (publishedEvent = event))

      const event = new ProceedRecipientAddedDLTEvent(
        CONTRACT_ID,
        "0x1234567890abcdef",
        "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
        "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
        "0x",
      )

      await eventBus.publishSync(event, ProceedRecipientAddedDLTEvent.name)

      expect(publishedEvent).toEqual(
        expect.objectContaining({
          contractId: CONTRACT_ID,
          proceedRecipientAddress: "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
          data: "0x",
          timestamp: expect.any(Number),
        }),
      )
    })

    it("should throw BondNotFoundError when bond does not exist", async () => {
      const event = new ProceedRecipientAddedDLTEvent(
        "0.0.9999999",
        "0x1234567890abcdef",
        "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
        "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
        "0x",
      )

      await expect(eventBus.publishSync(event, ProceedRecipientAddedDLTEvent.name)).rejects.toThrow(
        BondNotFoundError.contractIdError("0.0.9999999"),
      )
    })
  })
})
