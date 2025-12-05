// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import { CONTROLLERS, PROVIDERS } from "@components"
import { EventBus, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "@test/shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"
import { Repository } from "typeorm"
import { BondControlListMemberPersistence } from "@port/controllist/persistence/model/BondControlListMemberPersistence"
import { getRepositoryToken } from "@nestjs/typeorm"
import { AddedToControlListDLTEvent } from "@port/controllist/usecase/addcontrollistmember/model/AddedToControlListDLTEvent"
import { BondNotFoundError } from "@domain/bond/errors/BondNotFoundError"
import { BondPersistence } from "@port/bond/persistence/model/BondPersistence"
import { BondControlListMemberFoundError } from "@domain/controllist/errors/BondControlListMemberFoundError"

describe("AddControlListMemberNestJSEventAdapter Integration", () => {
  const CONTRACT_ID = "0.0.6974684"
  let app: INestApplication
  let container: PostgreSqlContainer
  let eventBus: EventBus
  let bondControlListMemberRepository: Repository<BondControlListMemberPersistence>
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
    bondControlListMemberRepository = app.get(getRepositoryToken(BondControlListMemberPersistence))
    bondRepository = app.get(getRepositoryToken(BondPersistence))
  })

  afterAll(async () => {
    await container.stop()
  })

  afterEach(async () => {
    await bondControlListMemberRepository.clear()
    await bondRepository.clear()
    await app.close()
  })

  describe("AddControlListMemberNestJSEventAdapter", () => {
    it("should add a new control list member when AddedToControlListDLTEvent is published", async () => {
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

      const event = new AddedToControlListDLTEvent(
        CONTRACT_ID,
        "0x1234567890abcdef",
        "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
        "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
      )

      await eventBus.publishSync(event, AddedToControlListDLTEvent.name)

      const savedMember = await bondControlListMemberRepository.findOne({
        where: { contractId: CONTRACT_ID, holderAccountId: "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7" },
      })

      expect(savedMember).toBeDefined()
      expect(savedMember).not.toBeNull()
      expect(savedMember!.contractId).toBe(CONTRACT_ID)
      expect(savedMember!.holderAccountId).toBe("0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7")
    })

    it("should throw BondControlListMemberFoundError when member with same contractId and holderId already exists", async () => {
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

      const existingMember = {
        contractId: CONTRACT_ID,
        holderAccountId: "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
      }

      await bondControlListMemberRepository.save(existingMember)

      const event = new AddedToControlListDLTEvent(
        CONTRACT_ID,
        "0x1234567890abcdef",
        "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
        "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
      )

      await expect(eventBus.publishSync(event, AddedToControlListDLTEvent.name)).rejects.toThrow(
        BondControlListMemberFoundError.contractIdAndHolderAccountIdError(
          CONTRACT_ID,
          "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
        ),
      )
    })

    it("should create multiple control list members for different holders successfully", async () => {
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

      const contractId = "0.0.6974684"
      const holders = ["0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7", "0x48ca774f6942166bf37e178ccc1e861947ead8c7"]

      for (const holder of holders) {
        const event = new AddedToControlListDLTEvent(contractId, "0x1234567890abcdef", holder, holder)

        await eventBus.publishSync(event, AddedToControlListDLTEvent.name)

        const savedMember = await bondControlListMemberRepository.findOne({
          where: { contractId, holderAccountId: holder },
        })

        expect(savedMember).toBeDefined()
        expect(savedMember).not.toBeNull()
        expect(savedMember!.contractId).toBe(contractId)
        expect(savedMember!.holderAccountId).toBe(holder)
      }

      const allMembers = await bondControlListMemberRepository.find()
      expect(allMembers).toHaveLength(holders.length)
    })

    it("should create control list members for different bonds successfully", async () => {
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

      const holderAccountId = "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7"

      for (const contractId of contracts) {
        const event = new AddedToControlListDLTEvent(
          contractId,
          "0x1234567890abcdef",
          "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
          holderAccountId,
        )

        await eventBus.publishSync(event, AddedToControlListDLTEvent.name)

        const savedMember = await bondControlListMemberRepository.findOne({
          where: { contractId, holderAccountId },
        })

        expect(savedMember).toBeDefined()
        expect(savedMember).not.toBeNull()
        expect(savedMember!.contractId).toBe(contractId)
        expect(savedMember!.holderAccountId).toBe(holderAccountId)
      }

      const allMembers = await bondControlListMemberRepository.find()
      expect(allMembers).toHaveLength(contracts.length)
    })

    it("should publish BondControlListMemberAddedEvent after successful member creation", async () => {
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

      const event = new AddedToControlListDLTEvent(
        CONTRACT_ID,
        "0x1234567890abcdef",
        "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
        "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
      )

      await eventBus.publishSync(event, AddedToControlListDLTEvent.name)

      expect(publishedEvent).toEqual(
        expect.objectContaining({
          contractId: "0.0.6974684",
          holderAccountId: "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
          timestamp: expect.any(Number),
        }),
      )
    })

    it("should throw BondNotFoundError when bond does not exist", async () => {
      const event = new AddedToControlListDLTEvent(
        "0.0.9999999",
        "0x1234567890abcdef",
        "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
        "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
      )

      await expect(eventBus.publishSync(event, AddedToControlListDLTEvent.name)).rejects.toThrow(
        BondNotFoundError.contractIdError("0.0.9999999"),
      )
    })
  })
})
