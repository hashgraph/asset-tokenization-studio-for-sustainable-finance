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
import { RemovedFromControlListDLTEvent } from "@port/controllist/usecase/removecontrollistmember/model/RemovedFromControlListDLTEvent"
import { BondNotFoundError } from "@domain/bond/errors/BondNotFoundError"
import { BondPersistence } from "@port/bond/persistence/model/BondPersistence"

describe("RemoveControlListMemberNestJSEventAdapter Integration", () => {
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

  describe("RemoveControlListMemberNestJSEventAdapter", () => {
    it("should delete control list member when RemovedFromControlListDLTEvent is published", async () => {
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

      const event = new RemovedFromControlListDLTEvent(
        CONTRACT_ID,
        "0x1234567890abcdef",
        "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
        "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
      )

      await eventBus.publishSync(event, RemovedFromControlListDLTEvent.name)

      const deletedMember = await bondControlListMemberRepository.findOne({
        where: { contractId: CONTRACT_ID, holderAccountId: "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7" },
      })

      expect(deletedMember).toBeNull()
    })

    it("should throw error when trying to delete non-existent member", async () => {
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

      const event = new RemovedFromControlListDLTEvent(
        CONTRACT_ID,
        "0x1234567890abcdef",
        "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
        "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
      )

      await expect(eventBus.publishSync(event, RemovedFromControlListDLTEvent.name)).rejects.toThrow()
    })

    it("should delete multiple control list members for different holders successfully", async () => {
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

      const holders = ["0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7", "0x48ca774f6942166bf37e178ccc1e861947ead8c7"]

      for (const holder of holders) {
        await bondControlListMemberRepository.save({
          contractId: CONTRACT_ID,
          holderAccountId: holder,
        })
      }

      for (const holder of holders) {
        const event = new RemovedFromControlListDLTEvent(CONTRACT_ID, "0x1234567890abcdef", holder, holder)

        await eventBus.publishSync(event, RemovedFromControlListDLTEvent.name)

        const deletedMember = await bondControlListMemberRepository.findOne({
          where: { contractId: CONTRACT_ID, holderAccountId: holder },
        })

        expect(deletedMember).toBeNull()
      }

      const allMembers = await bondControlListMemberRepository.find()
      expect(allMembers).toHaveLength(0)
    })

    it("should delete control list members for different bonds successfully", async () => {
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
        await bondControlListMemberRepository.save({
          contractId,
          holderAccountId,
        })
      }

      for (const contractId of contracts) {
        const event = new RemovedFromControlListDLTEvent(
          contractId,
          "0x1234567890abcdef",
          "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
          holderAccountId,
        )

        await eventBus.publishSync(event, RemovedFromControlListDLTEvent.name)

        const deletedMember = await bondControlListMemberRepository.findOne({
          where: { contractId, holderAccountId },
        })

        expect(deletedMember).toBeNull()
      }

      const allMembers = await bondControlListMemberRepository.find()
      expect(allMembers).toHaveLength(0)
    })

    it("should publish BondControlListMemberRemovedEvent after successful member deletion", async () => {
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

      await bondControlListMemberRepository.save({
        contractId: CONTRACT_ID,
        holderAccountId: "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
      })

      let publishedEvent: any
      jest.spyOn(eventBus, "publish").mockImplementation((event) => (publishedEvent = event))

      const event = new RemovedFromControlListDLTEvent(
        CONTRACT_ID,
        "0x1234567890abcdef",
        "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
        "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
      )

      await eventBus.publishSync(event, RemovedFromControlListDLTEvent.name)

      expect(publishedEvent).toEqual(
        expect.objectContaining({
          contractId: "0.0.6974684",
          holderAccountId: "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
          timestamp: expect.any(Number),
        }),
      )
    })

    it("should throw BondNotFoundError when bond does not exist", async () => {
      const event = new RemovedFromControlListDLTEvent(
        "0.0.9999999",
        "0x1234567890abcdef",
        "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
        "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
      )

      await expect(eventBus.publishSync(event, RemovedFromControlListDLTEvent.name)).rejects.toThrow(
        BondNotFoundError.contractIdError("0.0.9999999"),
      )
    })
  })
})
