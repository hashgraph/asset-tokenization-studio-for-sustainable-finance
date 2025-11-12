// SPDX-License-Identifier: Apache-2.0

import { INestApplication } from "@nestjs/common"
import { App } from "supertest/types"
import { Test, TestingModule } from "@nestjs/testing"
import { PostgreSqlContainer } from "../../../../shared/containers/PostgresqlContainer"
import { Repository } from "typeorm"
import { getRepositoryToken } from "@nestjs/typeorm"
import { CommandBus, EventBus, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { EVENT_LISTENER_PROVIDERS } from "../../../../../src/Components"
import { EventFilterPersistence } from "@port/persistence/eventfilter/model/EventFilterPersistence"
import { AddEventFiltersCommand } from "@app/eventfilter/addeventfilters/command/AddEventFiltersCommand"
import { EventListenerNestJSOnApplicationBootstrap } from "@port/listener/EventListenerNestJSOnApplicationBootstrap"
import { PostgresModule } from "../../../../shared/PostgresModule"

describe("AddEventFiltersCommandHandler", () => {
  let app: INestApplication<App>
  let container: PostgreSqlContainer
  let internalEventFilterRepository: Repository<EventFilterPersistence>
  let commandBus: CommandBus
  let eventBus: EventBus

  beforeAll(async () => {
    container = await PostgreSqlContainer.create()
  })

  beforeEach(async () => {
    const providers = EVENT_LISTENER_PROVIDERS.filter(
      (provider) => provider !== EventListenerNestJSOnApplicationBootstrap,
    )
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SharedModule, PostgresModule.forRoot(container.getConfig())],
      providers,
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
    internalEventFilterRepository = app.get(getRepositoryToken(EventFilterPersistence))
    commandBus = app.get("CommandBus")
    eventBus = app.get("EventBus")
  })

  afterAll(async () => {
    await container.stop()
  })

  afterEach(async () => {
    await internalEventFilterRepository.deleteAll()
  })

  it("should add event filters and publish EventFiltersAdded event", async () => {
    const eventSignatures = [
      "Transfer(address,address,uint256)",
      "AmountSnapshotExecuted(uint256,uint256,uint256,uint256,address[],address[],uint256[])",
    ]
    const command = new AddEventFiltersCommand("testContractName", eventSignatures)

    let publishedEvent
    jest.spyOn(eventBus, "publish").mockImplementation((event) => (publishedEvent = event))
    await commandBus.execute(command)

    const eventFilters = await internalEventFilterRepository.find()
    expect(eventFilters.find((eventFilter) => eventFilter.eventSignature === eventSignatures[0])).toEqual({
      id: expect.any(String),
      contractAddress: command.contractAddress,
      eventName: "Transfer",
      eventSignature: eventSignatures[0],
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      deletedAt: null,
    })

    expect(eventFilters.find((eventFilter) => eventFilter.eventSignature === eventSignatures[1])).toEqual({
      id: expect.any(String),
      contractAddress: command.contractAddress,
      eventName: "AmountSnapshotExecuted",
      eventSignature: eventSignatures[1],
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      deletedAt: null,
    })

    expect(publishedEvent).toEqual({
      contractAddress: command.contractAddress,
      eventSignatures: eventSignatures,
      timestamp: expect.any(Number),
    })
  })
})
