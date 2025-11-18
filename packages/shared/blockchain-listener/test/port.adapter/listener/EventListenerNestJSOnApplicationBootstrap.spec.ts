// SPDX-License-Identifier: Apache-2.0

import { INestApplication } from "@nestjs/common"
import { App } from "supertest/types"
import { Test, TestingModule } from "@nestjs/testing"
import { PostgreSqlContainer } from "../../shared/containers/PostgresqlContainer"
import { Repository } from "typeorm"
import { EventStorePersistence } from "@port/persistence/eventstore/model/EventStorePersistence"
import { getRepositoryToken } from "@nestjs/typeorm"
import { CommandBus, Event, EventListener, Handler, SharedModule, Singleton } from "@hashgraph/green-bonds-shared-core"
import BlockchainEvent from "@domain/event/BlockchainEvent"
import { EVENT_LISTENER_PROVIDERS } from "../../../src/Components"
import { EventStoreStatus } from "@domain/eventstore/model/EventStoreStatus"
import { SyncStatePersistence } from "@port/persistence/syncstate/model/SyncStatePersistence"
import { HederaPort } from "@port/blockchain/HederaPort"
import { GetBlockResponse } from "@port/blockchain/model/GetBlockResponse"
import { EventFilterPersistence } from "@port/persistence/eventfilter/model/EventFilterPersistence"
import { PostgresModule } from "../../shared/PostgresModule"
import { AddEventFiltersCommand } from "@app/eventfilter/addeventfilters/command/AddEventFiltersCommand"
import { TerminusModule } from "@nestjs/terminus"
import { PublishEventPortNestJSEventAdapter } from "@port/event/usecase/publishevent/PublishEventPortNestJSEventAdapter"
import { RabbitMQEventPublisherAdapter } from "@port/eventpublisher/RabbitMQEventPublisherAdapter"

describe("EventListenerNestJSOnApplicationBootstrap", () => {
  let app: INestApplication<App>
  let container: PostgreSqlContainer
  let internalEventStoreRepository: Repository<EventStorePersistence>
  let internalSyncStateRepository: Repository<SyncStatePersistence>
  let internalEventFilterRepository: Repository<EventFilterPersistence>
  let hederaPort: HederaPort
  let commandBus: CommandBus

  const blockNumber = 25169554
  const contract = "0xfd22c05d4d922f01baf6538237c80d1b0ec485b8"
  beforeAll(async () => {
    container = await PostgreSqlContainer.create()
    process.env.BLOCKCHAIN_LISTENER_BLOCK_NUMBER = blockNumber
    process.env.BLOCKCHAIN_LISTENER_POLL_INTERVAL = 3000
    process.env.BLOCKCHAIN_LISTENER_CONTRACTS = contract
    process.env.BLOCKCHAIN_LISTENER_EVENTS = "Transfer(address indexed from,address indexed to,uint256 value)"
  })

  beforeEach(async () => {
    const providers = EVENT_LISTENER_PROVIDERS.filter(
      (provider) =>
        provider !== PublishEventPortNestJSEventAdapter && provider?.useClass !== RabbitMQEventPublisherAdapter,
    )
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SharedModule, TerminusModule, PostgresModule.forRoot(container.getConfig())],
      providers: [...providers, ErrorDLTEventListener],
    }).compile()

    app = moduleFixture.createNestApplication()
    internalEventStoreRepository = app.get(getRepositoryToken(EventStorePersistence))
    internalSyncStateRepository = app.get(getRepositoryToken(SyncStatePersistence))
    internalEventFilterRepository = app.get(getRepositoryToken(EventFilterPersistence))
    hederaPort = app.get("HederaPort")
    commandBus = app.get("CommandBus")
  })

  afterAll(async () => {
    await container.stop()
  })

  afterEach(async () => {
    await internalEventStoreRepository.deleteAll()
    await internalSyncStateRepository.deleteAll()
    await internalEventFilterRepository.deleteAll()
  })

  it("should process event from configured block and event filter", async () => {
    const blockchainEvent = {
      transactionHash: "testTransactionHash",
      name: "Transfer",
      signature: "Transfer(address indexed from,address indexed to,uint256 value)",
      from: "testFrom",
      to: "testTo",
      value: 1000000,
    } as BlockchainEvent
    const errorBlockchainEvent = {
      transactionHash: "testTransactionHash",
      name: "Error",
      signature: "Error(uint256 field)",
      field: 1000000,
    } as BlockchainEvent
    const logsBloom = "0x000001"
    jest.spyOn(hederaPort, "getBlock").mockResolvedValue({ logsBloom } as GetBlockResponse)
    jest.spyOn(hederaPort, "fetchEvents").mockResolvedValueOnce([blockchainEvent])
    jest.spyOn(hederaPort, "fetchEvents").mockResolvedValue([errorBlockchainEvent]) // To stop processing blocks
    await app.init()

    await new Promise((resolve) => setTimeout(resolve, 1000)) // Wait time for processing to be completed
    const eventStore = await internalEventStoreRepository.findOneBy({ eventName: blockchainEvent.name })
    expect(eventStore).toEqual({
      id: expect.any(String),
      status: EventStoreStatus.PROCESSED,
      eventName: blockchainEvent.name,
      data: JSON.stringify(blockchainEvent),
      errorReason: null,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      deletedAt: null,
    })

    const syncStates = await internalSyncStateRepository.find()
    expect(syncStates.length).toEqual(1)
    expect(syncStates[0]).toEqual({
      id: expect.any(String),
      lastBlockNumber: blockNumber,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      deletedAt: null,
    })
  })

  it("should process event from dynamically created event filter", async () => {
    const blockchainEvent = {
      transactionHash: "testTransactionHash",
      name: "Transfer",
      signature: "Transfer(address indexed from,address indexed to,uint256 value)",
      from: "testFrom",
      to: "testTo",
      value: 1000000,
    } as BlockchainEvent
    const errorBlockchainEvent = {
      transactionHash: "testTransactionHash",
      name: "Error",
      signature: "Error(uint256 field)",
      field: 1000000,
    } as BlockchainEvent
    const logsBloom = "0x000001"
    delete process.env.BLOCKCHAIN_LISTENER_CONTRACTS
    delete process.env.BLOCKCHAIN_LISTENER_EVENTS
    jest.spyOn(hederaPort, "getBlock").mockResolvedValue({ logsBloom } as GetBlockResponse)
    jest.spyOn(hederaPort, "fetchEvents").mockResolvedValue([])
    await app.init()
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Wait time for processing to be started
    expect(jest.spyOn(hederaPort, "fetchEvents")).toHaveBeenLastCalledWith(
      expect.objectContaining({
        contractEvents: [],
      }),
    )
    await commandBus.execute(new AddEventFiltersCommand(contract, [blockchainEvent.signature]))
    jest.spyOn(hederaPort, "fetchEvents").mockResolvedValueOnce([blockchainEvent])
    jest.spyOn(hederaPort, "fetchEvents").mockResolvedValue([errorBlockchainEvent]) // To stop processing blocks

    await new Promise((resolve) => setTimeout(resolve, 1000)) // Wait time for processing to be completed

    expect(jest.spyOn(hederaPort, "fetchEvents")).toHaveBeenLastCalledWith(
      expect.objectContaining({
        contractEvents: [
          {
            contractAddress: contract,
            eventSignature: blockchainEvent.signature,
          },
        ],
      }),
    )

    const eventStore = await internalEventStoreRepository.findOneBy({ eventName: blockchainEvent.name })
    expect(eventStore).toEqual({
      id: expect.any(String),
      status: EventStoreStatus.PROCESSED,
      eventName: blockchainEvent.name,
      data: JSON.stringify(blockchainEvent),
      errorReason: null,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      deletedAt: null,
    })
  })

  it("should process event from stored block and event filter", async () => {
    const blockchainEvent = {
      transactionHash: "testTransactionHash",
      name: "AmountSnapshotExecuted",
      signature: "AmountSnapshotExecuted(uint256)",
      value: 1000000,
    } as BlockchainEvent
    const errorBlockchainEvent = {
      transactionHash: "testTransactionHash",
      name: "Error",
      signature: "Error(uint256 field)",
      field: 1000000,
    } as BlockchainEvent

    const logsBloom = "0x000001"
    const storedBlockNumber = blockNumber + 1000
    const syncState = new SyncStatePersistence()
    syncState.lastBlockNumber = storedBlockNumber
    await internalSyncStateRepository.save(syncState)

    const eventFilter = new EventFilterPersistence()
    eventFilter.contractAddress = "testContractAddress"
    eventFilter.eventName = blockchainEvent.name
    eventFilter.eventSignature = blockchainEvent.signature
    await internalEventFilterRepository.save(eventFilter)
    delete process.env.BLOCKCHAIN_LISTENER_CONTRACTS
    delete process.env.BLOCKCHAIN_LISTENER_EVENTS

    jest.spyOn(hederaPort, "getBlock").mockResolvedValue({ logsBloom } as GetBlockResponse)
    jest.spyOn(hederaPort, "fetchEvents").mockResolvedValueOnce([blockchainEvent])
    jest.spyOn(hederaPort, "fetchEvents").mockResolvedValue([errorBlockchainEvent]) // To stop processing blocks
    await app.init()

    await new Promise((resolve) => setTimeout(resolve, 1000)) // Wait time for processing to be completed
    expect(jest.spyOn(hederaPort, "fetchEvents")).toHaveBeenNthCalledWith(1, {
      blockNumber: storedBlockNumber + 1,
      logsBloom,
      contractEvents: [
        {
          contractAddress: eventFilter.contractAddress,
          eventSignature: eventFilter.eventSignature,
        },
      ],
    })
    const eventStore = await internalEventStoreRepository.findOneBy({ eventName: blockchainEvent.name })
    expect(eventStore).toEqual({
      id: expect.any(String),
      status: EventStoreStatus.PROCESSED,
      eventName: blockchainEvent.name,
      data: JSON.stringify(blockchainEvent),
      errorReason: null,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      deletedAt: null,
    })

    const syncStates = await internalSyncStateRepository.find()
    expect(syncStates.length).toEqual(1)
    expect(syncStates[0]).toEqual({
      id: expect.any(String),
      lastBlockNumber: storedBlockNumber + 1,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      deletedAt: null,
    })
  })

  it("if configured block is greater than stored block, configured block is used", async () => {
    const blockchainEvent = {
      transactionHash: "testTransactionHash",
      name: "AmountSnapshotExecuted",
      signature: "AmountSnapshotExecuted(uint256)",
      value: 1000000,
    } as BlockchainEvent
    const errorBlockchainEvent = {
      transactionHash: "testTransactionHash",
      name: "Error",
      signature: "Error(uint256 field)",
      field: 1000000,
    } as BlockchainEvent

    const logsBloom = "0x000001"
    const storedBlockNumber = blockNumber - 1000
    const syncState = new SyncStatePersistence()
    syncState.lastBlockNumber = storedBlockNumber
    await internalSyncStateRepository.save(syncState)

    jest.spyOn(hederaPort, "getBlock").mockResolvedValue({ logsBloom } as GetBlockResponse)
    jest.spyOn(hederaPort, "fetchEvents").mockResolvedValueOnce([blockchainEvent])
    jest.spyOn(hederaPort, "fetchEvents").mockResolvedValue([errorBlockchainEvent]) // To stop processing blocks
    await app.init()

    await new Promise((resolve) => setTimeout(resolve, 1000)) // Wait time for processing to be completed
    const eventStore = await internalEventStoreRepository.findOneBy({ eventName: blockchainEvent.name })
    expect(eventStore).toEqual({
      id: expect.any(String),
      status: EventStoreStatus.PROCESSED,
      eventName: blockchainEvent.name,
      data: JSON.stringify(blockchainEvent),
      errorReason: null,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      deletedAt: null,
    })

    const syncStates = await internalSyncStateRepository.find()
    expect(syncStates.length).toEqual(1)
    expect(syncStates[0]).toEqual({
      id: expect.any(String),
      lastBlockNumber: blockNumber,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      deletedAt: null,
    })
  })

  it("if there is no configured or stored block, last block from the blockchain is used", async () => {
    const blockchainEvent = {
      transactionHash: "testTransactionHash",
      name: "AmountSnapshotExecuted",
      signature: "AmountSnapshotExecuted(uint256)",
      value: 1000000,
    } as BlockchainEvent
    const errorBlockchainEvent = {
      transactionHash: "testTransactionHash",
      name: "Error",
      signature: "Error(uint256 field)",
      field: 1000000,
    } as BlockchainEvent

    delete process.env.BLOCKCHAIN_LISTENER_BLOCK_NUMBER
    const logsBloom = "0x000001"
    jest.spyOn(hederaPort, "getLastBlockNumber").mockResolvedValue(blockNumber)
    jest.spyOn(hederaPort, "getBlock").mockResolvedValue({ logsBloom } as GetBlockResponse)
    jest.spyOn(hederaPort, "fetchEvents").mockResolvedValueOnce([blockchainEvent])
    jest.spyOn(hederaPort, "fetchEvents").mockResolvedValue([errorBlockchainEvent]) // To stop processing blocks
    await app.init()

    await new Promise((resolve) => setTimeout(resolve, 1000)) // Wait time for processing to be completed
    const eventStore = await internalEventStoreRepository.findOneBy({ eventName: blockchainEvent.name })
    expect(eventStore).toEqual({
      id: expect.any(String),
      status: EventStoreStatus.PROCESSED,
      eventName: blockchainEvent.name,
      data: JSON.stringify(blockchainEvent),
      errorReason: null,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      deletedAt: null,
    })

    const syncStates = await internalSyncStateRepository.find()
    expect(syncStates.length).toEqual(1)
    expect(syncStates[0]).toEqual({
      id: expect.any(String),
      lastBlockNumber: blockNumber,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      deletedAt: null,
    })
  })

  it("if there is any error block processing is stopped", async () => {
    jest.spyOn(hederaPort, "getBlock").mockRejectedValue(new Error("test"))
    await app.init()

    await new Promise((resolve) => setTimeout(resolve, 1000)) // Wait time for processing to be completed
    expect(await internalEventStoreRepository.find()).toHaveLength(0)
    expect(await internalSyncStateRepository.find()).toHaveLength(0)
  })
})

class ErrorDLTEvent extends Event {
  readonly field: number
}

@Singleton()
class ErrorDLTEventListener implements EventListener<ErrorDLTEvent> {
  @Handler(ErrorDLTEvent)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handle(event: ErrorDLTEvent): any {
    throw new Error("test")
  }
}
