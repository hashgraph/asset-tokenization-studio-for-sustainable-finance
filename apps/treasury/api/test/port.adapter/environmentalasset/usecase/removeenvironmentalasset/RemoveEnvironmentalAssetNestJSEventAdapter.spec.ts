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
        contractId: "0.0.222",
        bondContractId: "0.0.500",
      })

      const environmentalAsset = await environmentalAssetRepository.save({
        contractId: "0.0.7777",
        treasuryId: treasury.id,
      })

      let publishedEvent
      jest.spyOn(ConverterUtils, "getHederaAddressFromEvm").mockResolvedValue(environmentalAsset.contractId)
      jest.spyOn(eventBus, "publish").mockImplementation((event) => (publishedEvent = event))
      const event = new ERC721RemovedDLTEvent(
        treasury.contractId,
        "testTransactionHash",
        "testOperator",
        "0x16E6eD454447935176fC5095a8C4231306E38b2b",
      )
      await eventBus.publishSync(event, ERC721RemovedDLTEvent.name)

      const environmentalAssets = await environmentalAssetRepository.find({
        where: { treasuryId: treasury.id },
      })
      expect(environmentalAssets).toHaveLength(1)
      expect(environmentalAssets[0].validityDate).toEqual(expect.any(Date))

      expect(publishedEvent).toEqual({
        treasuryContractId: treasury.contractId,
        bondContractId: treasury.bondContractId,
        assetContractId: environmentalAsset.contractId,
        timestamp: expect.any(Number),
      })
    })

    it("should throw EnvironmentalAssetNotFoundError when trying to remove a non-existing token", async () => {
      const treasury = await internalTreasuryRepository.save({
        contractId: "0.0.222",
        bondContractId: "0.0.500",
      })

      const assetContractId = "0.0.44432"
      jest.spyOn(ConverterUtils, "getHederaAddressFromEvm").mockResolvedValue(assetContractId)
      const event = new ERC721RemovedDLTEvent(
        treasury.contractId,
        "testTransactionHash",
        "testOperator",
        "0x16E6eD454447935176fC5095a8C4231306E38b2b",
      )
      await expect(eventBus.publishSync(event, ERC721RemovedDLTEvent.name)).rejects.toThrow(
        EnvironmentalAssetNotFoundError.idError(assetContractId),
      )

      const environmentalAssets = await environmentalAssetRepository.find({
        where: { treasuryId: treasury.id },
      })
      expect(environmentalAssets).toHaveLength(0)
    })
  })

  describe("when treasury does not exist", () => {
    it("should throw TreasuryNotFoundError", async () => {
      const treasuryContractId = "0.0.88890"
      const event = new ERC721RemovedDLTEvent(
        treasuryContractId,
        "testTransactionHash",
        "testOperator",
        "0x16E6eD454447935176fC5095a8C4231306E38b2b",
      )
      await expect(eventBus.publishSync(event, ERC721RemovedDLTEvent.name)).rejects.toThrow(
        TreasuryNotFoundError.contractIdsError([treasuryContractId]),
      )
    })
  })
})
