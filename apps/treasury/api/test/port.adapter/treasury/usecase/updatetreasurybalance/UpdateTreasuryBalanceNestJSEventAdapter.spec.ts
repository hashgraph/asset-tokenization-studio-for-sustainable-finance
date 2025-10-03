// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import { CONTROLLERS, PROVIDERS } from "../../../../../src/Components"
import { EventBus, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "../../../../shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"
import { Repository } from "typeorm"
import { TreasuryPersistence } from "@port/persistence/treasury/model/TreasuryPersistence"
import { getRepositoryToken } from "@nestjs/typeorm"
import { TransferDLTEvent } from "@port/treasury/usecase/updatetreasurybalance/model/TransferDLTEvent"
import { TreasuryNotFoundError } from "@domain/treasury/errors/TreasuryNotFoundError"

describe("FundProceedsRecipientTransaction API Integration", () => {
  let app: INestApplication
  let container: PostgreSqlContainer
  let eventBus: EventBus
  let internalTreasuryRepository: Repository<TreasuryPersistence>

  beforeAll(async () => {
    container = await PostgreSqlContainer.create()
  })

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SharedModule, PostgresModule.forRoot(container.getConfig())],
      controllers: CONTROLLERS,
      providers: PROVIDERS,
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
    eventBus = app.get("EventBus")
    internalTreasuryRepository = app.get(getRepositoryToken(TreasuryPersistence))
  })

  afterAll(async () => {
    await container.stop()
  })

  afterEach(async () => {
    await internalTreasuryRepository.deleteAll()
    await app.close()
  })

  describe("UpdateTreasuryBalanceNestJSEventAdapter", () => {
    it("should throw TreasuryNotFoundError when treasury is not found", async () => {
      const event = new TransferDLTEvent("0x001", "0x002", "100000")

      await expect(eventBus.publishSync(event, TransferDLTEvent.name)).rejects.toThrow(
        TreasuryNotFoundError.addressesError([event.from, event.to]),
      )
    })

    it("should increase treasury balance", async () => {
      let treasury = await internalTreasuryRepository.save({
        contractAddress: "0x002",
        bondContractAddress: "0x003",
        balance: "0",
      })

      let publishedEvent
      jest.spyOn(eventBus, "publish").mockImplementation((event) => (publishedEvent = event))
      const event = new TransferDLTEvent("0x001", treasury.contractAddress, "100000")
      await eventBus.publishSync(event, TransferDLTEvent.name)

      treasury = await internalTreasuryRepository.findOneBy({ id: treasury.id })
      expect(treasury.balance).toEqual(event.value)

      expect(publishedEvent).toEqual({
        contractAddress: treasury.contractAddress,
        bondContractAddress: treasury.bondContractAddress,
        amount: event.value,
        balance: treasury.balance,
        timestamp: expect.any(Number),
      })
    })

    it("should decrease treasury balance", async () => {
      let treasury = await internalTreasuryRepository.save({
        contractAddress: "0x002",
        bondContractAddress: "0x003",
        balance: "200000",
      })

      let publishedEvent
      jest.spyOn(eventBus, "publish").mockImplementation((event) => (publishedEvent = event))
      const event = new TransferDLTEvent(treasury.contractAddress, "0x001", "100000")
      await eventBus.publishSync(event, TransferDLTEvent.name)

      treasury = await internalTreasuryRepository.findOneBy({ id: treasury.id })
      expect(treasury.balance).toEqual("100000")

      expect(publishedEvent).toEqual({
        contractAddress: treasury.contractAddress,
        bondContractAddress: treasury.bondContractAddress,
        amount: event.value,
        balance: treasury.balance,
        timestamp: expect.any(Number),
      })
    })
  })
})
