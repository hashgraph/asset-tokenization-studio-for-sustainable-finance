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
import { HoldByPartitionExecutedDLTEvent } from "@port/hold/usecase/executedholdbypartition/model/HoldByPartitionExecutedDLTEvent"

describe("ExecutedHoldByPartitionNestJSEventAdapter Integration", () => {
  let app: INestApplication
  let eventBus: EventBus
  let bondHoldRepository: Repository<BondHoldPersistence>
  let bondHolderBalanceRepository: Repository<BondHolderBalancePersistence>

  const HOLDER_ADDRESS = "0x48ca774f6942166bf37e178ccc1e861947ead8c7"
  const HOLDER_HEDERA_ID = "0.0.1234567"
  const TO_ADDRESS = "0x68ca774f6942166bf37e178ccc1e861947ead8d8"
  const TO_HEDERA_ID = "0.0.7654321"
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
        [TO_ADDRESS.toLowerCase()]: TO_HEDERA_ID,
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

  describe("ExecutedHoldByPartitionNestJSEventAdapter", () => {
    it("should execute hold by reducing holder held balance and increasing recipient available balance", async () => {
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

      // Create initial recipient balance
      await bondHolderBalanceRepository.save({
        contractId: CONTRACT_HEDERA_ID,
        holderAccountId: TO_HEDERA_ID,
        partition: "0x0000000000000000000000000000000000000000000000000000000000000000",
        availableBalance: "50",
        heldBalance: "0",
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
        toAccountId: TO_HEDERA_ID,
        data: "",
        operatorData: "",
        operatorAccountId: "",
      })

      const event = new HoldByPartitionExecutedDLTEvent(
        CONTRACT_HEDERA_ID,
        "0x1234567890abcdef",
        HOLDER_ADDRESS,
        "0x0000000000000000000000000000000000000000000000000000000000000000",
        "1",
        "30",
        TO_ADDRESS,
      )

      await eventBus.publishSync(event, HoldByPartitionExecutedDLTEvent.name)

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

      // Verify holder balance was updated
      const holderBalance = await bondHolderBalanceRepository.findOne({
        where: {
          contractId: CONTRACT_HEDERA_ID,
          holderAccountId: HOLDER_HEDERA_ID,
          partition: "0x0000000000000000000000000000000000000000000000000000000000000000",
        },
      })
      expect(holderBalance).toBeDefined()
      expect(holderBalance!.heldBalance).toBe("20") // 50 - 30
      expect(holderBalance!.availableBalance).toBe("100")

      // Verify recipient balance was increased
      const recipientBalance = await bondHolderBalanceRepository.findOne({
        where: {
          contractId: CONTRACT_HEDERA_ID,
          holderAccountId: TO_HEDERA_ID,
          partition: "0x0000000000000000000000000000000000000000000000000000000000000000",
        },
      })
      expect(recipientBalance).toBeDefined()
      expect(recipientBalance!.availableBalance).toBe("80") // 50 + 30
      expect(recipientBalance!.heldBalance).toBe("0")
    })

    it("should create new recipient balance if recipient does not exist", async () => {
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
        toAccountId: TO_HEDERA_ID,
        data: "",
        operatorData: "",
        operatorAccountId: "",
      })

      const event = new HoldByPartitionExecutedDLTEvent(
        CONTRACT_HEDERA_ID,
        "0x1234567890abcdef",
        HOLDER_ADDRESS,
        "0x0000000000000000000000000000000000000000000000000000000000000000",
        "1",
        "30",
        TO_ADDRESS,
      )

      await eventBus.publishSync(event, HoldByPartitionExecutedDLTEvent.name)

      // Verify new recipient balance was created
      const recipientBalance = await bondHolderBalanceRepository.findOne({
        where: {
          contractId: CONTRACT_HEDERA_ID,
          holderAccountId: TO_HEDERA_ID,
          partition: "0x0000000000000000000000000000000000000000000000000000000000000000",
        },
      })
      expect(recipientBalance).toBeDefined()
      expect(recipientBalance!.availableBalance).toBe("30")
      expect(recipientBalance!.heldBalance).toBe("0")
      expect(recipientBalance!.lockedBalance).toBe("0")
    })
  })
})
