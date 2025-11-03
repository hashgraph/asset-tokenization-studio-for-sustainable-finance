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
import { TokenPausedDLTEvent } from "@port/treasury/usecase/pausetreasury/model/TokenPausedDLTEvent"
import { TreasuryPausedEvent } from "@domain/treasury/event/TreasuryPausedEvent"
import { TreasuryNotFoundError } from "@domain/treasury/errors/TreasuryNotFoundError"
import { PaymentTokenPersistence } from "@port/persistence/paymenttoken/model/PaymentTokenPersistence"
import { TreasuryAlreadyPausedError } from "@domain/treasury/errors/TreasuryAlreadyPausedError"

describe("PauseTreasury Integration", () => {
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
  })

  it("should pause treasury", async () => {
    let treasury = await internalTreasuryRepository.save({
      contractId: "0.0.6625592",
      bondContractId: "0.0.6974684",
      paused: false,
    })
    const paymentToken = {
      contractId: "0.0.5703967",
      treasuryId: treasury.id,
      treasury: treasury,
      decimals: 8,
    } as PaymentTokenPersistence
    treasury.paymentToken = paymentToken
    treasury = await internalTreasuryRepository.save(treasury)

    let publishedEvent
    jest.spyOn(eventBus, "publish").mockImplementation((event) => (publishedEvent = event))

    const event = new TokenPausedDLTEvent(
      treasury.contractId,
      "testTransactionHash",
      "0x8B8De7629CccF9306193E8E03F9aa1d7458c19a8",
    )
    await eventBus.publishSync(event, TokenPausedDLTEvent.name)

    const updatedTreasury = await internalTreasuryRepository.findOneBy({ id: treasury.id })
    expect(updatedTreasury.paused).toEqual(true)

    expect(publishedEvent.constructor.name).toEqual(TreasuryPausedEvent.name)
    expect(publishedEvent).toEqual({
      treasuryContractId: treasury.contractId,
      timestamp: expect.any(Number),
    })
  })

  it("should throw error if treasury does not exist", async () => {
    const nonExistentTreasuryContractId = "0.0.999"

    const event = new TokenPausedDLTEvent(
      nonExistentTreasuryContractId,
      "testTransactionHash",
      "0x8B8De7629CccF9306193E8E03F9aa1d7458c19a8",
    )

    await expect(eventBus.publishSync(event, TokenPausedDLTEvent.name)).rejects.toThrow(
      TreasuryNotFoundError.contractIdError(nonExistentTreasuryContractId),
    )
  })

  it("should throw error if treasury is already paused", async () => {
    const treasury = await internalTreasuryRepository.save({
      contractId: "0.0.6625592",
      bondContractId: "0.0.6974684",
      paused: true,
    })

    const event = new TokenPausedDLTEvent(
      treasury.contractId,
      "testTransactionHash",
      "0x8B8De7629CccF9306193E8E03F9aa1d7458c19a8",
    )

    await expect(eventBus.publishSync(event, TokenPausedDLTEvent.name)).rejects.toThrow(
      TreasuryAlreadyPausedError.forTreasury(treasury.contractId),
    )
  })
})
