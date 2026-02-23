// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import { CONTROLLERS, PROVIDERS } from "@components"
import { ConverterUtils, EventBus, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "@test/shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"
import { Repository } from "typeorm"
import { BondHoldPersistence } from "@port/hold/persistence/model/BondHoldPersistence"
import { BondHolderBalancePersistence } from "@port/holderbalance/persistence/model/BondHolderBalancePersistence"
import { getRepositoryToken } from "@nestjs/typeorm"
import { HoldByPartitionReclaimedDLTEvent } from "@port/hold/usecase/reclaimedholdbypartition/model/HoldByPartitionReclaimedDLTEvent"
import { BondPersistence } from "@port/bond/persistence/model/BondPersistence"

describe("ReclaimedHoldByPartitionNestJSEventAdapter Integration", () => {
  let app: INestApplication
  let eventBus: EventBus
  let bondHoldRepository: Repository<BondHoldPersistence>
  let bondHolderBalanceRepository: Repository<BondHolderBalancePersistence>
  let bondRepository: Repository<BondPersistence>

  const HOLDER_ADDRESS = "0x48ca774f6942166bf37e178ccc1e861947ead8c7"
  const HOLDER_HEDERA_ID = "0.0.1234567"
  const OPERATOR_ADDRESS = "0x58ca774f6942166bf37e178ccc1e861947ead8d9"
  const CONTRACT_ADDRESS = "0xb3533f32594b689f19a94c608490451478f7197b"
  const CONTRACT_HEDERA_ID = "0.0.6974684"
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SharedModule, PostgresModule.forRoot(PostgreSqlContainer.getWorkerConfig())],
      controllers: CONTROLLERS,
      providers: [...PROVIDERS],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
    eventBus = app.get("EventBus")
    bondHoldRepository = app.get(getRepositoryToken(BondHoldPersistence))
    bondHolderBalanceRepository = app.get(getRepositoryToken(BondHolderBalancePersistence))
    bondRepository = app.get(getRepositoryToken(BondPersistence))

    jest.spyOn(ConverterUtils, "getHederaAddressFromEvm").mockImplementation((address: string) => {
      const addressMap: Record<string, string> = {
        [HOLDER_ADDRESS.toLowerCase()]: HOLDER_HEDERA_ID,
        [OPERATOR_ADDRESS.toLowerCase()]: "0.0.8888888",
        [CONTRACT_ADDRESS.toLowerCase()]: CONTRACT_HEDERA_ID,
      }
      return Promise.resolve(addressMap[address.toLowerCase()] || "0.0.9999999")
    })
  })
  afterEach(async () => {
    await bondHoldRepository.query('DELETE FROM "Bonds"')
    await bondHolderBalanceRepository.query('DELETE FROM "Bonds"')
    jest.restoreAllMocks()
    await app.close()
  })

  describe("ReclaimedHoldByPartitionNestJSEventAdapter", () => {
    it("should reclaim expired hold by returning held balance to available balance", async () => {
      jest.spyOn(eventBus, "publish").mockImplementation(() => {})

      // Create bond first
      await bondRepository.save({
        contractId: CONTRACT_HEDERA_ID,
        treasuryId: "0.0.1000001",
        name: "Test Bond",
        symbol: "TBOND",
        isin: "US1234567890",
        decimals: 18,
        currency: "USD",
        nominalValue: "1000000000000000000",
        nominalValueDecimals: 18,
        startingDate: new Date("2025-01-01"),
        maturityDate: new Date("2030-01-01"),
        maxSupply: "1000000000000000000000",
        isPaused: false,
      })

      // Create initial holder balance with held tokens
      await bondHolderBalanceRepository.save({
        bondContractId: CONTRACT_HEDERA_ID,
        holderAccountId: HOLDER_HEDERA_ID,
        partition: "0x0000000000000000000000000000000000000000000000000000000000000000",
        availableBalance: "100",
        heldBalance: "50",
        lockedBalance: "0",
      })

      // Create expired hold
      await bondHoldRepository.save({
        id: 1,
        bondContractId: CONTRACT_HEDERA_ID,
        holderAccountId: HOLDER_HEDERA_ID,
        partition: "0x0000000000000000000000000000000000000000000000000000000000000000",
        amount: "50",
        expirationTimestamp: new Date(Date.now() - 86400000), // Expired 1 day ago
        escrowAccountId: "0.0.111111",
        toAccountId: "0.0.222222",
        data: "",
        operatorData: "",
        operatorAccountId: "",
      })

      const event = new HoldByPartitionReclaimedDLTEvent(
        CONTRACT_HEDERA_ID,
        "0x1234567890abcdef",
        OPERATOR_ADDRESS,
        HOLDER_ADDRESS,
        "0x0000000000000000000000000000000000000000000000000000000000000000",
        "1",
        "50",
      )

      await eventBus.publishSync(event, HoldByPartitionReclaimedDLTEvent.name)

      // Verify hold was deleted
      const deletedHold = await bondHoldRepository.findOne({
        where: {
          id: 1,
          bondContractId: CONTRACT_HEDERA_ID,
          holderAccountId: HOLDER_HEDERA_ID,
          partition: "0x0000000000000000000000000000000000000000000000000000000000000000",
        },
      })
      expect(deletedHold).toBeNull()

      // Verify holder balance was updated: heldBalance reduced, availableBalance increased
      const holderBalance = await bondHolderBalanceRepository.findOne({
        where: {
          bondContractId: CONTRACT_HEDERA_ID,
          holderAccountId: HOLDER_HEDERA_ID,
          partition: "0x0000000000000000000000000000000000000000000000000000000000000000",
        },
      })
      expect(holderBalance).toBeDefined()
      expect(holderBalance!.heldBalance).toBe("0") // 50 - 50 (reclaim always full amount)
      expect(holderBalance!.availableBalance).toBe("150") // 100 + 50
      expect(holderBalance!.lockedBalance).toBe("0")
    })

    it("should reclaim hold with full amount only (no partial reclaim)", async () => {
      jest.spyOn(eventBus, "publish").mockImplementation(() => {})

      // Create bond first
      await bondRepository.save({
        contractId: CONTRACT_HEDERA_ID,
        treasuryId: "0.0.1000001",
        name: "Test Bond",
        symbol: "TBOND",
        isin: "US1234567890",
        decimals: 18,
        currency: "USD",
        nominalValue: "1000000000000000000",
        nominalValueDecimals: 18,
        startingDate: new Date("2025-01-01"),
        maturityDate: new Date("2030-01-01"),
        maxSupply: "1000000000000000000000",
        isPaused: false,
      })

      // Create initial holder balance
      await bondHolderBalanceRepository.save({
        bondContractId: CONTRACT_HEDERA_ID,
        holderAccountId: HOLDER_HEDERA_ID,
        partition: "0x0000000000000000000000000000000000000000000000000000000000000000",
        availableBalance: "200",
        heldBalance: "100",
        lockedBalance: "0",
      })

      // Create expired hold
      await bondHoldRepository.save({
        id: 2,
        bondContractId: CONTRACT_HEDERA_ID,
        holderAccountId: HOLDER_HEDERA_ID,
        partition: "0x0000000000000000000000000000000000000000000000000000000000000000",
        amount: "75",
        expirationTimestamp: new Date(Date.now() - 3600000), // Expired 1 hour ago
        escrowAccountId: "0.0.111111",
        toAccountId: "0.0.222222",
        data: "",
        operatorData: "",
        operatorAccountId: "",
      })

      const event = new HoldByPartitionReclaimedDLTEvent(
        CONTRACT_HEDERA_ID,
        "0x1234567890abcdef",
        OPERATOR_ADDRESS,
        HOLDER_ADDRESS,
        "0x0000000000000000000000000000000000000000000000000000000000000000",
        "2",
        "75", // Reclaim always returns full amount
      )

      await eventBus.publishSync(event, HoldByPartitionReclaimedDLTEvent.name)

      // Verify hold was deleted
      const deletedHold = await bondHoldRepository.findOne({
        where: {
          id: 2,
          bondContractId: CONTRACT_HEDERA_ID,
          holderAccountId: HOLDER_HEDERA_ID,
          partition: "0x0000000000000000000000000000000000000000000000000000000000000000",
        },
      })
      expect(deletedHold).toBeNull()

      // Verify full amount was reclaimed
      const holderBalance = await bondHolderBalanceRepository.findOne({
        where: {
          bondContractId: CONTRACT_HEDERA_ID,
          holderAccountId: HOLDER_HEDERA_ID,
          partition: "0x0000000000000000000000000000000000000000000000000000000000000000",
        },
      })
      expect(holderBalance).toBeDefined()
      expect(holderBalance!.heldBalance).toBe("25") // 100 - 75
      expect(holderBalance!.availableBalance).toBe("275") // 200 + 75
    })

    it("should handle reclaim when operator is the token holder", async () => {
      jest.spyOn(eventBus, "publish").mockImplementation(() => {})

      // Create bond first
      await bondRepository.save({
        contractId: CONTRACT_HEDERA_ID,
        treasuryId: "0.0.1000001",
        name: "Test Bond",
        symbol: "TBOND",
        isin: "US1234567890",
        decimals: 18,
        currency: "USD",
        nominalValue: "1000000000000000000",
        nominalValueDecimals: 18,
        startingDate: new Date("2025-01-01"),
        maturityDate: new Date("2030-01-01"),
        maxSupply: "1000000000000000000000",
        isPaused: false,
      })

      // Create initial holder balance
      await bondHolderBalanceRepository.save({
        bondContractId: CONTRACT_HEDERA_ID,
        holderAccountId: HOLDER_HEDERA_ID,
        partition: "0x0000000000000000000000000000000000000000000000000000000000000000",
        availableBalance: "50",
        heldBalance: "30",
        lockedBalance: "0",
      })

      // Create expired hold
      await bondHoldRepository.save({
        id: 3,
        bondContractId: CONTRACT_HEDERA_ID,
        holderAccountId: HOLDER_HEDERA_ID,
        partition: "0x0000000000000000000000000000000000000000000000000000000000000000",
        amount: "30",
        expirationTimestamp: new Date(Date.now() - 7200000), // Expired 2 hours ago
        escrowAccountId: "0.0.111111",
        toAccountId: "0.0.222222",
        data: "",
        operatorData: "",
        operatorAccountId: "",
      })

      // Holder reclaims their own expired hold
      const event = new HoldByPartitionReclaimedDLTEvent(
        CONTRACT_HEDERA_ID,
        "0x1234567890abcdef",
        HOLDER_ADDRESS, // Operator is the holder
        HOLDER_ADDRESS,
        "0x0000000000000000000000000000000000000000000000000000000000000000",
        "3",
        "30",
      )

      await eventBus.publishSync(event, HoldByPartitionReclaimedDLTEvent.name)

      // Verify hold was deleted
      const deletedHold = await bondHoldRepository.findOne({
        where: {
          id: 3,
          bondContractId: CONTRACT_HEDERA_ID,
          holderAccountId: HOLDER_HEDERA_ID,
          partition: "0x0000000000000000000000000000000000000000000000000000000000000000",
        },
      })
      expect(deletedHold).toBeNull()

      // Verify balance was updated correctly
      const holderBalance = await bondHolderBalanceRepository.findOne({
        where: {
          bondContractId: CONTRACT_HEDERA_ID,
          holderAccountId: HOLDER_HEDERA_ID,
          partition: "0x0000000000000000000000000000000000000000000000000000000000000000",
        },
      })
      expect(holderBalance).toBeDefined()
      expect(holderBalance!.heldBalance).toBe("0") // 30 - 30
      expect(holderBalance!.availableBalance).toBe("80") // 50 + 30
    })
  })
})
