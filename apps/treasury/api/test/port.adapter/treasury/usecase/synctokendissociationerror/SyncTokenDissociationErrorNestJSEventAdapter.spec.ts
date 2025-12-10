// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import { CONTROLLERS, PROVIDERS } from "../../../../../src/Components"
import { ConverterUtils, EventBus, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "../../../../shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"
import { Repository } from "typeorm"
import { TreasuryPersistence } from "@port/persistence/treasury/model/TreasuryPersistence"
import { getRepositoryToken } from "@nestjs/typeorm"
import { PaymentTokenPersistence } from "@port/persistence/paymenttoken/model/PaymentTokenPersistence"
import { TokenDissociatedDLTEvent } from "@port/treasury/usecase/synctokendissociationerror/model/TokenDissociatedDLTEvent"
import { PaymentTokenDissociationErrorUpdatedEvent } from "@domain/paymenttoken/event/PaymentTokenDissociationErrorUpdatedEvent"
import { EnvironmentalAssetPersistence } from "@port/persistence/environmentalasset/model/EnvironmentalAssetPersistence"
import { EnvironmentalAssetDissociationErrorUpdatedEvent } from "@domain/environmentalasset/event/EnvironmentalAssetDissociationErrorUpdatedEvent"

describe("SyncTokenDissociationError Integration", () => {
  let app: INestApplication
  let eventBus: EventBus
  let internalTreasuryRepository: Repository<TreasuryPersistence>
  let internalPaymentTokenRepository: Repository<PaymentTokenPersistence>
  let internalEnvironmentalAssetRepository: Repository<EnvironmentalAssetPersistence>
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SharedModule, PostgresModule.forRoot(PostgreSqlContainer.getWorkerConfig())],
      controllers: CONTROLLERS,
      providers: PROVIDERS,
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
    eventBus = app.get("EventBus")
    internalTreasuryRepository = app.get(getRepositoryToken(TreasuryPersistence))
    internalPaymentTokenRepository = app.get(getRepositoryToken(PaymentTokenPersistence))
    internalEnvironmentalAssetRepository = app.get(getRepositoryToken(EnvironmentalAssetPersistence))
  })
  afterEach(async () => {
    await internalEnvironmentalAssetRepository.deleteAll()
    await internalTreasuryRepository.deleteAll()
  })

  it("should remove payment token dissociation error", async () => {
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
      dissociationError: 333,
      removalDate: new Date(),
    } as PaymentTokenPersistence
    treasury.paymentToken = paymentToken
    treasury = await internalTreasuryRepository.save(treasury)

    let publishedEvent
    jest.spyOn(eventBus, "publish").mockImplementation((event) => (publishedEvent = event))
    jest.spyOn(ConverterUtils, "getHederaAddressFromEvm").mockResolvedValueOnce(paymentToken.contractId)

    const event = new TokenDissociatedDLTEvent(
      treasury.contractId,
      "testTransactionHash",
      "0x8B8De7629CccF9306193E8E03F9aa1d7458c19a8",
    )
    await eventBus.publishSync(event, TokenDissociatedDLTEvent.name)

    const updatedPaymentToken = await internalPaymentTokenRepository.findOneBy({ id: paymentToken.id })
    expect(updatedPaymentToken.dissociationError).toBeNull()

    expect(publishedEvent.constructor.name).toEqual(PaymentTokenDissociationErrorUpdatedEvent.name)
    expect(publishedEvent).toEqual({
      treasuryContractId: treasury.contractId,
      paymentTokenContractId: paymentToken.contractId,
      timestamp: expect.any(Number),
    })
  })

  it("should remove environmental asset dissociation error", async () => {
    const treasury = await internalTreasuryRepository.save({
      contractId: "0.0.6625592",
      bondContractId: "0.0.6974684",
      paused: false,
    })
    const environmentalAsset = await internalEnvironmentalAssetRepository.save({
      contractId: "0.0.7777",
      treasuryId: treasury.id,
      dissociationError: 888,
      removalDate: new Date(),
    })

    let publishedEvent
    jest.spyOn(eventBus, "publish").mockImplementation((event) => (publishedEvent = event))
    jest.spyOn(ConverterUtils, "getHederaAddressFromEvm").mockResolvedValueOnce(environmentalAsset.contractId)

    const event = new TokenDissociatedDLTEvent(
      treasury.contractId,
      "testTransactionHash",
      "0x8B8De7629CccF9306193E8E03F9aa1d7458c19a8",
    )
    await eventBus.publishSync(event, TokenDissociatedDLTEvent.name)

    const updatedEnvironmentalAsset = await internalEnvironmentalAssetRepository.findOneBy({
      id: environmentalAsset.id,
    })
    expect(updatedEnvironmentalAsset.dissociationError).toBeNull()

    expect(publishedEvent.constructor.name).toEqual(EnvironmentalAssetDissociationErrorUpdatedEvent.name)
    expect(publishedEvent).toEqual({
      treasuryContractId: treasury.contractId,
      environmentalAssetContractId: environmentalAsset.contractId,
      timestamp: expect.any(Number),
    })
  })
})
