import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import { CONTROLLERS, PROVIDERS } from "../../../../../src/Components"
import { ConverterUtils, EventBus, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "../../../../shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"
import { Repository } from "typeorm"
import { TreasuryPersistence } from "@port/persistence/treasury/model/TreasuryPersistence"
import { EnvironmentalAssetPersistence } from "@port/persistence/environmentalasset/model/EnvironmentalAssetPersistence"
import { getRepositoryToken } from "@nestjs/typeorm"
import { EnvironmentalAssetAddedDLTEvent } from "@port/environmentalasset/usecase/addenvironmentalasset/model/ERC721AddedDLTEvent"
import { TreasuryNotFoundError } from "@domain/treasury/errors/TreasuryNotFoundError"
import { EnvironmentalAssetAlreadyExistsError } from "@domain/environmentalasset/errors/EnvironmentalAssetAlreadyExistsError"

describe("AddEnvironmentalAsset API Integration", () => {
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

  describe("when treasury exists", () => {
    it("should add environmental asset to treasury", async () => {
      const treasury = await internalTreasuryRepository.save({
        contractId: "0.0.222",
        bondContractId: "0.0.500",
        paused: false,
      })

      let publishedEvent
      const assetContractId = "0.0.56744"
      jest.spyOn(ConverterUtils, "getHederaAddressFromEvm").mockResolvedValue(assetContractId)
      jest.spyOn(eventBus, "publish").mockImplementation((event) => (publishedEvent = event))
      const event = new EnvironmentalAssetAddedDLTEvent(
        treasury.contractId,
        "testTransactionHash",
        "testOperator",
        "0x16E6eD454447935176fC5095a8C4231306E38b2b",
      )
      await eventBus.publishSync(event, EnvironmentalAssetAddedDLTEvent.name)

      const environmentalAssets = await environmentalAssetRepository.find({
        where: { treasuryId: treasury.id },
      })
      expect(environmentalAssets).toHaveLength(1)
      expect(environmentalAssets[0].treasuryId).toBe(treasury.id)

      expect(publishedEvent).toEqual({
        treasuryContractId: treasury.contractId,
        bondContractId: treasury.bondContractId,
        assetContractId: assetContractId,
        timestamp: expect.any(Number),
      })
    })

    it("should throw EnvironmentalAssetAlreadyExistsError when trying to add an existing token", async () => {
      const treasury = await internalTreasuryRepository.save({
        contractId: "0.0.222",
        bondContractId: "0.0.500",
        paused: false,
      })

      const environmentalAsset = await environmentalAssetRepository.save({
        contractId: "0x002",
        treasuryId: treasury.id,
      })

      jest.spyOn(ConverterUtils, "getHederaAddressFromEvm").mockResolvedValue(environmentalAsset.contractId)
      const event = new EnvironmentalAssetAddedDLTEvent(
        treasury.contractId,
        "testTransactionHash",
        "testOperator",
        "0x16E6eD454447935176fC5095a8C4231306E38b2b",
      )
      await expect(eventBus.publishSync(event, EnvironmentalAssetAddedDLTEvent.name)).rejects.toThrow(
        EnvironmentalAssetAlreadyExistsError.idError("0x002"),
      )

      const environmentalAssets = await environmentalAssetRepository.find({
        where: { treasuryId: treasury.id },
      })
      expect(environmentalAssets).toHaveLength(1)
    })
  })

  describe("when treasury does not exist", () => {
    it("should throw TreasuryNotFoundError", async () => {
      const event = new EnvironmentalAssetAddedDLTEvent(
        "0x999",
        "testTransactionHash",
        "testOperator",
        "0x16E6eD454447935176fC5095a8C4231306E38b2b",
      )
      await expect(eventBus.publishSync(event, EnvironmentalAssetAddedDLTEvent.name)).rejects.toThrow(
        TreasuryNotFoundError.contractIdsError(["0x999"]),
      )
    })
  })
})
