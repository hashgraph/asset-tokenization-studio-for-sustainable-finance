// SPDX-License-Identifier: Apache-2.0

import { INestApplication } from "@nestjs/common"
import { App } from "supertest/types"
import { Test, TestingModule } from "@nestjs/testing"
import { PostgreSqlContainer } from "../../../../shared/containers/PostgresqlContainer"
import { Repository, Not, IsNull } from "typeorm"
import { SyncStatePersistence } from "@port/persistence/syncstate/model/SyncStatePersistence"
import { getRepositoryToken } from "@nestjs/typeorm"
import { CommandBus, EventBus, SharedModule, TransactionManager } from "@hashgraph/green-bonds-shared-core"
import { SetSyncStateCommand } from "@app/syncstate/setsyncstate/command/SetSyncStateCommand"
import { EVENT_LISTENER_PROVIDERS } from "../../../../../src/Components"
import { EventListenerNestJSOnApplicationBootstrap } from "@port/listener/EventListenerNestJSOnApplicationBootstrap"
import { PostgresModule } from "../../../../shared/PostgresModule"
import { TerminusModule } from "@nestjs/terminus"
import { PublishEventPortNestJSEventAdapter } from "@port/event/usecase/publishevent/PublishEventPortNestJSEventAdapter"
import { RabbitMQEventPublisherAdapter } from "@port/eventpublisher/RabbitMQEventPublisherAdapter"
import { SyncStateStatus } from "@domain/syncstate/model/SyncStateStatus"

describe("SetSyncStateCommandHandler", () => {
  let app: INestApplication<App>
  let container: PostgreSqlContainer
  let internalSyncStateRepository: Repository<SyncStatePersistence>
  let commandBus: CommandBus
  let eventBus: EventBus
  let transactionManager: TransactionManager

  beforeAll(async () => {
    container = await PostgreSqlContainer.create()
  })

  beforeEach(async () => {
    const providers = EVENT_LISTENER_PROVIDERS.filter(
      (provider) =>
        ![EventListenerNestJSOnApplicationBootstrap, PublishEventPortNestJSEventAdapter].includes(provider) &&
        provider?.useClass !== RabbitMQEventPublisherAdapter,
    )
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SharedModule, TerminusModule, PostgresModule.forRoot(container.getConfig())],
      providers,
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
    internalSyncStateRepository = app.get(getRepositoryToken(SyncStatePersistence))
    commandBus = app.get("CommandBus")
    eventBus = app.get("EventBus")
    transactionManager = app.get("TransactionManager")

    await internalSyncStateRepository.deleteAll()
  })

  afterAll(async () => {
    await container.stop()
  })

  afterEach(async () => {
    await internalSyncStateRepository.deleteAll()
  })

  it("should save sync state and publish SyncStateSet event when no SyncState exists", async () => {
    const lastBlockNumber = 25252469

    let publishedEvent
    jest.spyOn(eventBus, "publish").mockImplementation((event) => (publishedEvent = event))
    await transactionManager.execute(async (transactionId) => {
      const command = new SetSyncStateCommand(transactionId, <string>SyncStateStatus.OK, lastBlockNumber)
      await commandBus.execute(command)
    })

    const syncState = await internalSyncStateRepository.findOneBy({ lastBlockNumber: lastBlockNumber })
    expect(syncState).toEqual({
      id: expect.any(String),
      lastBlockNumber: lastBlockNumber,
      status: SyncStateStatus.OK,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      deletedAt: null,
    })

    expect(publishedEvent).toEqual(
      expect.objectContaining({
        lastBlockNumber: lastBlockNumber,
        status: <string>SyncStateStatus.OK,
      }),
    )
  })

  it("should save sync state and publish SyncStateSet event when SyncState already exists", async () => {
    const lastBlockNumber = 25252469

    let publishedEvent
    jest.spyOn(eventBus, "publish").mockImplementation((event) => (publishedEvent = event))
    await transactionManager.execute(async (transactionId) => {
      const command = new SetSyncStateCommand(transactionId, <string>SyncStateStatus.OK, lastBlockNumber)
      await commandBus.execute(command)
    })

    let syncState = await internalSyncStateRepository.findOneBy({ lastBlockNumber: lastBlockNumber })
    const syncStateId = syncState.id
    expect(syncState).toEqual({
      id: expect.any(String),
      lastBlockNumber: lastBlockNumber,
      status: SyncStateStatus.OK,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      deletedAt: null,
    })

    expect(publishedEvent).toEqual(
      expect.objectContaining({
        lastBlockNumber: lastBlockNumber,
        status: <string>SyncStateStatus.OK,
      }),
    )

    const newLastBlockNumber = 25252470

    let newPublishedEvent
    jest.spyOn(eventBus, "publish").mockImplementation((event) => (newPublishedEvent = event))
    await transactionManager.execute(async (transactionId) => {
      const command = new SetSyncStateCommand(transactionId, <string>SyncStateStatus.FAILED, newLastBlockNumber)
      await commandBus.execute(command)
    })

    syncState = await internalSyncStateRepository.findOne({
      where: {
        lastBlockNumber: Not(IsNull()),
      },
    })
    expect(syncState).toEqual({
      id: syncStateId,
      lastBlockNumber: newLastBlockNumber,
      status: SyncStateStatus.FAILED,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      deletedAt: null,
    })

    expect(newPublishedEvent).toEqual(
      expect.objectContaining({
        lastBlockNumber: newLastBlockNumber,
        status: <string>SyncStateStatus.FAILED,
      }),
    )
  })
})
