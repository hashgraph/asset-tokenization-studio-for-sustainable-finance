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
import { HoldByPartitionReleasedDLTEvent } from "@port/hold/usecase/releasedholdbypartition/model/HoldByPartitionReleasedDLTEvent"

describe("ReleasedHoldByPartitionNestJSEventAdapter Integration", () => {
  let app: INestApplication
  let eventBus: EventBus
  let bondHoldRepository: Repository<BondHoldPersistence>
  let bondHolderBalanceRepository: Repository<BondHolderBalancePersistence>

  const HOLDER_ADDRESS = "0x48ca774f6942166bf37e178ccc1e861947ead8c7"
  const HOLDER_HEDERA_ID = "0.0.1234567"
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

    jest.spyOn(ConverterUtils, "getHederaAddressFromEvm").mockImplementation((address: string) => {
      const addressMap: Record<string, string> = {
        [HOLDER_ADDRESS.toLowerCase()]: HOLDER_HEDERA_ID,
        [CONTRACT_ADDRESS.toLowerCase()]: CONTRACT_HEDERA_ID,
      }
      return Promise.resolve(addressMap[address.toLowerCase()] || "0.0.9999999")
    })
  })
  afterEach(async () => {
    await bondHoldRepository.clear()
    await bondHolderBalanceRepository.clear()
    jest.restoreAllMocks()
    await app.close()
  })

  describe("ReleasedHoldByPartitionNestJSEventAdapter", () => {
    it("should release hold by returning held balance to available balance", async () => {
      jest.spyOn(eventBus, "publish").mockImplementation(() => {})

      // Create initial holder balance with held tokens
      await bondHolderBalanceRepository.save({
        contractId: CONTRACT_HEDERA_ID,
        holderAccountId: HOLDER_HEDERA_ID,
        partition: "0x0000000000000000000000000000000000000000000000000000000000000000",
        availableBalance: "100",
        heldBalance: "50",
        lockedBalance: "0",
      })

      // Create hold
      await bondHoldRepository.save({
        id: 1,
        contractId: CONTRACT_HEDERA_ID,
        holderAccountId: HOLDER_HEDERA_ID,
        partition: "0x0000000000000000000000000000000000000000000000000000000000000000",
        amount: "30",
        expirationTimestamp: new Date(Date.now() + 86400000),
        escrowAccountId: "0.0.111111",
        toAccountId: "0.0.222222",
        data: "",
        operatorData: "",
        operatorAccountId: "",
      })

      const event = new HoldByPartitionReleasedDLTEvent(
        CONTRACT_HEDERA_ID,
        "0x1234567890abcdef",
        HOLDER_ADDRESS,
        "0x0000000000000000000000000000000000000000000000000000000000000000",
        "1",
        "30",
      )

      await eventBus.publishSync(event, HoldByPartitionReleasedDLTEvent.name)

      // Verify hold was deleted
      const deletedHold = await bondHoldRepository.findOne({
        where: {
          id: 1,
          contractId: CONTRACT_HEDERA_ID,
          holderAccountId: HOLDER_HEDERA_ID,
          partition: "0x0000000000000000000000000000000000000000000000000000000000000000",
        },
      })
      expect(deletedHold).toBeNull()

      // Verify holder balance was updated: heldBalance reduced, availableBalance increased
      const holderBalance = await bondHolderBalanceRepository.findOne({
        where: {
          contractId: CONTRACT_HEDERA_ID,
          holderAccountId: HOLDER_HEDERA_ID,
          partition: "0x0000000000000000000000000000000000000000000000000000000000000000",
        },
      })
      expect(holderBalance).toBeDefined()
      expect(holderBalance!.heldBalance).toBe("20") // 50 - 30
      expect(holderBalance!.availableBalance).toBe("130") // 100 + 30
      expect(holderBalance!.lockedBalance).toBe("0")
    })

    it("should release partial hold amount", async () => {
      jest.spyOn(eventBus, "publish").mockImplementation(() => {})

      // Create initial holder balance with held tokens
      await bondHolderBalanceRepository.save({
        contractId: CONTRACT_HEDERA_ID,
        holderAccountId: HOLDER_HEDERA_ID,
        partition: "0x0000000000000000000000000000000000000000000000000000000000000000",
        availableBalance: "100",
        heldBalance: "50",
        lockedBalance: "0",
      })

      // Create hold
      await bondHoldRepository.save({
        id: 1,
        contractId: CONTRACT_HEDERA_ID,
        holderAccountId: HOLDER_HEDERA_ID,
        partition: "0x0000000000000000000000000000000000000000000000000000000000000000",
        amount: "50",
        expirationTimestamp: new Date(Date.now() + 86400000),
        escrowAccountId: "0.0.111111",
        toAccountId: "0.0.222222",
        data: "",
        operatorData: "",
        operatorAccountId: "",
      })

      // Release only 20 out of 50 held tokens
      const event = new HoldByPartitionReleasedDLTEvent(
        CONTRACT_HEDERA_ID,
        "0x1234567890abcdef",
        HOLDER_ADDRESS,
        "0x0000000000000000000000000000000000000000000000000000000000000000",
        "1",
        "20",
      )

      await eventBus.publishSync(event, HoldByPartitionReleasedDLTEvent.name)

      // Verify holder balance was updated with partial release
      const holderBalance = await bondHolderBalanceRepository.findOne({
        where: {
          contractId: CONTRACT_HEDERA_ID,
          holderAccountId: HOLDER_HEDERA_ID,
          partition: "0x0000000000000000000000000000000000000000000000000000000000000000",
        },
      })
      expect(holderBalance).toBeDefined()
      expect(holderBalance!.heldBalance).toBe("30") // 50 - 20
      expect(holderBalance!.availableBalance).toBe("120") // 100 + 20
    })

    it("should release full hold amount and delete hold", async () => {
      jest.spyOn(eventBus, "publish").mockImplementation(() => {})

      // Create initial holder balance
      await bondHolderBalanceRepository.save({
        contractId: CONTRACT_HEDERA_ID,
        holderAccountId: HOLDER_HEDERA_ID,
        partition: "0x0000000000000000000000000000000000000000000000000000000000000000",
        availableBalance: "100",
        heldBalance: "50",
        lockedBalance: "0",
      })

      // Create hold
      await bondHoldRepository.save({
        id: 1,
        contractId: CONTRACT_HEDERA_ID,
        holderAccountId: HOLDER_HEDERA_ID,
        partition: "0x0000000000000000000000000000000000000000000000000000000000000000",
        amount: "50",
        expirationTimestamp: new Date(Date.now() + 86400000),
        escrowAccountId: "0.0.111111",
        toAccountId: "0.0.222222",
        data: "",
        operatorData: "",
        operatorAccountId: "",
      })

      const event = new HoldByPartitionReleasedDLTEvent(
        CONTRACT_HEDERA_ID,
        "0x1234567890abcdef",
        HOLDER_ADDRESS,
        "0x0000000000000000000000000000000000000000000000000000000000000000",
        "1",
        "50",
      )

      await eventBus.publishSync(event, HoldByPartitionReleasedDLTEvent.name)

      // Verify hold was deleted
      const deletedHold = await bondHoldRepository.findOne({
        where: {
          id: 1,
          contractId: CONTRACT_HEDERA_ID,
          holderAccountId: HOLDER_HEDERA_ID,
          partition: "0x0000000000000000000000000000000000000000000000000000000000000000",
        },
      })
      expect(deletedHold).toBeNull()

      // Verify all held balance was released
      const holderBalance = await bondHolderBalanceRepository.findOne({
        where: {
          contractId: CONTRACT_HEDERA_ID,
          holderAccountId: HOLDER_HEDERA_ID,
          partition: "0x0000000000000000000000000000000000000000000000000000000000000000",
        },
      })
      expect(holderBalance).toBeDefined()
      expect(holderBalance!.heldBalance).toBe("0") // 50 - 50
      expect(holderBalance!.availableBalance).toBe("150") // 100 + 50
    })
  })
})
