import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import { CONTROLLERS, PROVIDERS } from "../../../../../src/Components"
import { EventBus, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "../../../../shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"
import { Repository } from "typeorm"
import { TreasuryPersistence } from "@port/persistence/treasury/model/TreasuryPersistence"
import { EnvironmentalAssetPersistence } from "@port/persistence/environmentalasset/model/EnvironmentalAssetPersistence"
import { getRepositoryToken } from "@nestjs/typeorm"
import { ERC721RemovedDLTEvent } from "@port/environmentalasset/usecase/removeenvironmentalasset/model/ERC721RemovedDLTEvent"
import { TreasuryNotFoundError } from "@domain/treasury/errors/TreasuryNotFoundError"
import { EnvironmentalAssetNotFoundError } from "@domain/environmentalasset/errors/EnvironmentalAssetNotFoundError"

describe("RemoveEnvironmentalAsset API Integration", () => {
  let app: INestApplication
  let container: PostgreSqlContainer
  let eventBus: EventBus
  let internalTreasuryRepository: Repository<TreasuryPersistence>
  let environmentalAssetRepository: Repository<EnvironmentalAssetPersistence>

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
    environmentalAssetRepository = app.get(getRepositoryToken(EnvironmentalAssetPersistence))
  })

  afterAll(async () => {
    await container.stop()
  })

  afterEach(async () => {
    await environmentalAssetRepository.deleteAll()
    await internalTreasuryRepository.deleteAll()
  })

  describe("when treasury and environmental asset exist", () => {
    it("should remove environmental asset from treasury", async () => {
      const treasury = await internalTreasuryRepository.save({
        contractAddress: "0x001",
        bondContractAddress: "0x003",
        balance: "100000",
      })

      await environmentalAssetRepository.save({
        assetId: "0x002",
        treasuryId: treasury.id,
      })

      let publishedEvent
      jest.spyOn(eventBus, "publish").mockImplementation((event) => (publishedEvent = event))
      const event = new ERC721RemovedDLTEvent(treasury.contractAddress, "0x002")
      await eventBus.publishSync(event, ERC721RemovedDLTEvent.name)

      const environmentalAssets = await environmentalAssetRepository.find({
        where: { treasuryId: treasury.id },
      })
      expect(environmentalAssets).toHaveLength(0)

      expect(publishedEvent).toEqual({
        contractAddress: treasury.contractAddress,
        bondContractAddress: treasury.bondContractAddress,
        erc721Address: event.erc721,
        deletedAt: expect.any(Date),
        timestamp: expect.any(Number),
      })
    })

    it("should handle different ERC721 addresses", async () => {
      const treasury = await internalTreasuryRepository.save({
        contractAddress: "0x001",
        bondContractAddress: "0x003",
        balance: "100000",
      })

      await environmentalAssetRepository.save({
        assetId: "0x002",
        treasuryId: treasury.id,
      })
      await environmentalAssetRepository.save({
        assetId: "0x999",
        treasuryId: treasury.id,
      })

      let publishedEvent
      jest.spyOn(eventBus, "publish").mockImplementation((event) => (publishedEvent = event))
      const event = new ERC721RemovedDLTEvent(treasury.contractAddress, "0x999")
      await eventBus.publishSync(event, ERC721RemovedDLTEvent.name)

      const environmentalAssets = await environmentalAssetRepository.find({
        where: { treasuryId: treasury.id },
      })
      expect(environmentalAssets).toHaveLength(1)
      expect(environmentalAssets[0].assetId).toBe("0x002")

      expect(publishedEvent).toEqual({
        contractAddress: treasury.contractAddress,
        bondContractAddress: treasury.bondContractAddress,
        erc721Address: event.erc721,
        deletedAt: expect.any(Date),
        timestamp: expect.any(Number),
      })
    })

    it("should throw EnvironmentalAssetNotFoundError when trying to remove a non-existing token", async () => {
      const treasury = await internalTreasuryRepository.save({
        contractAddress: "0x001",
        bondContractAddress: "0x003",
        balance: "100000",
      })

      const event = new ERC721RemovedDLTEvent(treasury.contractAddress, "0x999")
      await expect(eventBus.publishSync(event, ERC721RemovedDLTEvent.name)).rejects.toThrow(
        EnvironmentalAssetNotFoundError.idError("0x999"),
      )

      const environmentalAssets = await environmentalAssetRepository.find({
        where: { treasuryId: treasury.id },
      })
      expect(environmentalAssets).toHaveLength(0)
    })
  })

  describe("when treasury does not exist", () => {
    it("should throw TreasuryNotFoundError", async () => {
      const event = new ERC721RemovedDLTEvent("0x999", "0x002")
      await expect(eventBus.publishSync(event, ERC721RemovedDLTEvent.name)).rejects.toThrow(
        TreasuryNotFoundError.addressesError(["0x999"]),
      )
    })
  })
})
