// SPDX-License-Identifier: Apache-2.0

import { INestApplication } from "@nestjs/common"
import { App } from "supertest/types"
import { Test, TestingModule } from "@nestjs/testing"
import { ENTITIES, PostgresModule } from "../shared/PostgresModule"
import { PostgreSqlContainer } from "../shared/containers/PostgresqlContainer"
import { Repository } from "typeorm"
import { SyncStatePersistence } from "@port/persistence/syncstate/model/SyncStatePersistence"
import { getRepositoryToken } from "@nestjs/typeorm"
import {
  CommandBus,
  EventBus,
  EventListener,
  Handler,
  SharedModule,
  Singleton,
} from "@hashgraph/green-bonds-shared-core"
import { PROVIDERS } from "../../src/Components"
import { EventStoreStatus } from "@domain/eventstore/model/EventStoreStatus"

describe("SetSyncStateCommandHandler", () => {
  let app: INestApplication<App>
  let container: PostgreSqlContainer
  let internalSyncStateRepository: Repository<SyncStatePersistence>
  let commandBus: CommandBus
  let eventBus: EventBus

  beforeEach(async () => {
    container = await PostgreSqlContainer.create()
  })

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SharedModule, PostgresModule.forRoot(container.getConfig(), ENTITIES)],
      providers: [...PROVIDERS],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
    internalSyncStateRepository = app.get(getRepositoryToken(SyncStatePersistence))
    commandBus = app.get("CommandBus")
    eventBus = app.get("EventBus")
  })

  afterAll(async () => {
    await container.stop()
  })

  afterEach(async () => {
    await internalSyncStateRepository.deleteAll()
  })

  it("should save sync state and publish SyncStateSet event", async () => {
    const syncState = {
      lastBlockNumber: 25252469,
      lastTimestamp: "1758750263"
    }
    const command = new SetSyncStateCommand(syncState)

    let publishedEvent
    jest.spyOn(eventBus, "publish").mockImplementation((event) => (publishedEvent = event))
    await commandBus.execute(command)

    const syncState = await internalSyncStateRepository.findOneBy({ lastBlockNumber: syncState.lastBlockNumber })
    expect(syncState).toEqual({
      lastBlockNumber: syncState.lastBlockNumber,
      lastTimestamp: syncState.lastTimestamp,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    })

    expect(publishedEvent).toEqual({
      lastBlockNumber: syncState.lastBlockNumber,
      lastTimestamp: syncState.lastTimestamp,
      timestamp: expect.any(Number),
    })
  })
})
