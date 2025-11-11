// SPDX-License-Identifier: Apache-2.0

import { INestApplication } from "@nestjs/common"
import { App } from "supertest/types"
import { Test, TestingModule } from "@nestjs/testing"
import { PostgreSqlContainer } from "../../../../shared/containers/PostgresqlContainer"
import { Repository } from "typeorm"
import { EventStorePersistence } from "@port/persistence/eventstore/model/EventStorePersistence"
import { getRepositoryToken } from "@nestjs/typeorm"
import {
  CommandBus,
  Event,
  EventBus,
  EventListener,
  Handler,
  SharedModule,
  Singleton,
} from "@hashgraph/green-bonds-shared-core"
import { ProcessEventCommand } from "@app/eventstore/processevent/command/ProcessEventCommand"

import { EVENT_LISTENER_PROVIDERS } from "../../../../../src/Components"
import { EventStoreStatus } from "@domain/eventstore/model/EventStoreStatus"
import { EventListenerNestJSOnApplicationBootstrap } from "@port/listener/EventListenerNestJSOnApplicationBootstrap"
import { PostgresModule } from "../../../../shared/PostgresModule"
import { BlockchainEvent } from "@port/blockchain/model/BlockchainEvent"

let testDLTEvent: TestDLTEvent
let errorOnDLTEventListener: boolean
describe("ProcessEventCommandHandler", () => {
  let app: INestApplication<App>
  let container: PostgreSqlContainer
  let internalEventStoreRepository: Repository<EventStorePersistence>
  let commandBus: CommandBus
  let eventBus: EventBus

  beforeAll(async () => {
    container = await PostgreSqlContainer.create()
  })

  beforeEach(async () => {
    const providers = EVENT_LISTENER_PROVIDERS.filter((provider) => provider !== EventListenerNestJSOnApplicationBootstrap)
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SharedModule, PostgresModule.forRoot(container.getConfig())],
      providers: [...providers, TestDLTEventListener],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
    internalEventStoreRepository = app.get(getRepositoryToken(EventStorePersistence))
    commandBus = app.get("CommandBus")
    eventBus = app.get("EventBus")
  })

  afterAll(async () => {
    await container.stop()
  })

  afterEach(async () => {
    await internalEventStoreRepository.deleteAll()
    errorOnDLTEventListener = false
    testDLTEvent = null
  })

  it("should process event, save Event store and publish EventProcessed event", async () => {
    const blockchainEvent = {
      transactionHash: "testTransactionHash",
      name: "Test",
      signature: "Test(address)",
      field: "testField",
      contractId: "0.0.123",
      logTimestamp: "1234567890",
      timestamp: 1234567890,
    } as BlockchainEvent
    const command = new ProcessEventCommand(blockchainEvent as Event)

    let publishedEvent
    jest.spyOn(eventBus, "publish").mockImplementation((event) => (publishedEvent = event))
    await commandBus.execute(command)

    const eventStore = await internalEventStoreRepository.findOneBy({ eventName: blockchainEvent.name })
    expect(eventStore).toEqual({
      id: publishedEvent.id,
      status: EventStoreStatus.PROCESSED,
      eventName: blockchainEvent.name,
      data: JSON.stringify(blockchainEvent),
      errorReason: null,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      deletedAt: null,
    })

    expect(publishedEvent).toEqual({
      id: publishedEvent.id,
      status: EventStoreStatus.PROCESSED,
      eventName: blockchainEvent.name,
      errorReason: null,
      timestamp: expect.any(Number),
    })

    expect(testDLTEvent).toEqual(
      expect.objectContaining({
        field: blockchainEvent.field,
      }),
    )
  })

  it("should process event, save Event store in failed status and publish EventProcessed event", async () => {
    errorOnDLTEventListener = true
    const blockchainEvent = {
      transactionHash: "testTransactionHash",
      name: "Test",
      signature: "Test(address)",
      field: "testField",
      contractId: "0.0.123",
      logTimestamp: "1234567890",
      timestamp: 1234567890,
    } as BlockchainEvent
    const command = new ProcessEventCommand(blockchainEvent as Event)

    let publishedEvent
    jest.spyOn(eventBus, "publish").mockImplementation((event) => (publishedEvent = event))
    await commandBus.execute(command)

    const eventStore = await internalEventStoreRepository.findOneBy({ eventName: blockchainEvent.name })
    expect(eventStore).toEqual({
      id: publishedEvent.id,
      status: EventStoreStatus.FAILED,
      eventName: blockchainEvent.name,
      data: JSON.stringify(blockchainEvent),
      errorReason: "test",
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      deletedAt: null,
    })

    expect(publishedEvent).toEqual({
      id: publishedEvent.id,
      status: EventStoreStatus.FAILED,
      eventName: blockchainEvent.name,
      errorReason: "test",
      timestamp: expect.any(Number),
    })
  })
})

class TestDLTEvent extends Event {
  readonly field: string
}

@Singleton()
class TestDLTEventListener implements EventListener<TestDLTEvent> {
  @Handler(TestDLTEvent)
  handle(event: TestDLTEvent): any {
    if (errorOnDLTEventListener) {
      throw new Error("test")
    }
    // To test event is processed synchronously
    return new Promise((resolve) => {
      setTimeout(() => {
        testDLTEvent = event
        resolve()
      }, 1000)
    })
  }
}
