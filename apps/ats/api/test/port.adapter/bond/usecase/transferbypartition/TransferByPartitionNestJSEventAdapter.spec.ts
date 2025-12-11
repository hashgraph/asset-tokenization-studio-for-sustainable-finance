// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import { CONTROLLERS, PROVIDERS } from "@components"
import { ConverterUtils, EventBus, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "@test/shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"
import { Repository } from "typeorm"
import { getRepositoryToken } from "@nestjs/typeorm"
import { TransferByPartitionDLTEvent } from "@port/holderbalance/usecase/transferbypartition/model/TransferByPartitionDLTEvent"
import { BondHolderBalancePersistence } from "@port/holderbalance/persistence/model/BondHolderBalancePersistence"
import { BondPersistence } from "@port/bond/persistence/model/BondPersistence"
import { BondHolderBalanceNotFoundError } from "@domain/holderbalance/errors/BondHolderBalanceNotFoundError"

describe("TransferByPartitionNestJSEventAdapter Integration", () => {
  let app: INestApplication
  let eventBus: EventBus
  let bondHolderBalanceRepository: Repository<BondHolderBalancePersistence>
  let bondRepository: Repository<BondPersistence>

  const createTestBond = async (contractId: string = "0.0.6974684"): Promise<BondPersistence> => {
    const bond = {
      contractId,
      treasuryId: "0.0.6974684",
      kpiId: "0.0.6974684",
      name: "Test Bond",
      symbol: "TB",
      isin: "US1234567890",
      decimals: 2,
      currency: "USD",
      nominalValue: "100",
      nominalValueDecimals: 2,
      startingDate: new Date("2023-01-01"),
      maturityDate: new Date("2028-01-01"),
      maxSupply: "1000000",
    }
    return await bondRepository.save(bond)
  }
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SharedModule, PostgresModule.forRoot(PostgreSqlContainer.getWorkerConfig())],
      controllers: CONTROLLERS,
      providers: [...PROVIDERS],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
    eventBus = app.get("EventBus")
    bondHolderBalanceRepository = app.get(getRepositoryToken(BondHolderBalancePersistence))
    bondRepository = app.get(getRepositoryToken(BondPersistence))

    // Mock the ConverterUtils to return consistent Hedera addresses
    jest.spyOn(ConverterUtils, "getHederaAddressFromEvm").mockImplementation((address: string) => {
      const addressMap: Record<string, string> = {
        "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7": "0.0.6974684", // contractId
        "0x48ca774f6942166bf37e178ccc1e861947ead8c7": "0.0.1234567", // operator
        "0xb3533f32594B689F19A94C608490451478F7197b": "0.0.7654321", // from (sender)
        "0x1234567890abcdef1234567890abcdef12345678": "0.0.9876543", // to (receiver)
      }
      return Promise.resolve(addressMap[address] || "0.0.9999999")
    })
  })
  afterEach(async () => {
    await bondHolderBalanceRepository.query('DELETE FROM "Bonds"')
    await bondRepository.query('DELETE FROM "Bonds"')
    jest.restoreAllMocks()
    await app.close()
  })

  describe("TransferByPartitionNestJSEventAdapter", () => {
    it("should transfer balance from sender to receiver when TransferByPartitionDLTEvent is published", async () => {
      await createTestBond("0.0.6974684")

      // Create sender with balance
      await bondHolderBalanceRepository.save({
        bondContractId: "0.0.6974684",
        holderAccountId: "0.0.7654321",
        partition: "0x0000000000000000000000000000000000000000000000000000000000000001",
        availableBalance: "5000",
        lockedBalance: "0",
      })

      // Create receiver with existing balance
      await bondHolderBalanceRepository.save({
        bondContractId: "0.0.6974684",
        holderAccountId: "0.0.9876543",
        partition: "0x0000000000000000000000000000000000000000000000000000000000000001",
        availableBalance: "1000",
        lockedBalance: "0",
      })

      const event = new TransferByPartitionDLTEvent(
        "0.0.6974684",
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        "0x0000000000000000000000000000000000000000000000000000000000000001",
        "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
        "0xb3533f32594B689F19A94C608490451478F7197b",
        "0x1234567890abcdef1234567890abcdef12345678",
        "2000",
        "0x",
        "0x",
      )

      await eventBus.publishSync(event, TransferByPartitionDLTEvent.name)

      // Check sender balance was reduced
      const senderBalance = await bondHolderBalanceRepository.findOne({
        where: { bondContractId: "0.0.6974684", holderAccountId: "0.0.7654321" },
      })
      expect(senderBalance).toBeDefined()
      expect(senderBalance!.availableBalance).toBe("3000")

      // Check receiver balance was increased
      const receiverBalance = await bondHolderBalanceRepository.findOne({
        where: { bondContractId: "0.0.6974684", holderAccountId: "0.0.9876543" },
      })
      expect(receiverBalance).toBeDefined()
      expect(receiverBalance!.availableBalance).toBe("3000")
    })

    it("should create new receiver account if it doesn't exist", async () => {
      await createTestBond("0.0.6974684")

      // Create only sender with balance
      await bondHolderBalanceRepository.save({
        bondContractId: "0.0.6974684",
        holderAccountId: "0.0.7654321",
        partition: "0x0000000000000000000000000000000000000000000000000000000000000001",
        availableBalance: "5000",
        lockedBalance: "0",
      })

      const event = new TransferByPartitionDLTEvent(
        "0.0.6974684",
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        "0x0000000000000000000000000000000000000000000000000000000000000001",
        "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
        "0xb3533f32594B689F19A94C608490451478F7197b",
        "0x1234567890abcdef1234567890abcdef12345678",
        "2000",
        "0x",
        "0x",
      )

      await eventBus.publishSync(event, TransferByPartitionDLTEvent.name)

      // Check sender balance was reduced
      const senderBalance = await bondHolderBalanceRepository.findOne({
        where: { bondContractId: "0.0.6974684", holderAccountId: "0.0.7654321" },
      })
      expect(senderBalance).toBeDefined()
      expect(senderBalance!.availableBalance).toBe("3000")

      // Check new receiver account was created with transferred amount
      const receiverBalance = await bondHolderBalanceRepository.findOne({
        where: { bondContractId: "0.0.6974684", holderAccountId: "0.0.9876543" },
      })
      expect(receiverBalance).toBeDefined()
      expect(receiverBalance!.availableBalance).toBe("2000")
      expect(receiverBalance!.lockedBalance).toBe("0")
    })

    it("should throw BondHolderBalanceNotFoundError when sender doesn't exist", async () => {
      await createTestBond("0.0.6974684")

      const event = new TransferByPartitionDLTEvent(
        "0.0.6974684",
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        "0x0000000000000000000000000000000000000000000000000000000000000001",
        "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
        "0xb3533f32594B689F19A94C608490451478F7197b",
        "0x1234567890abcdef1234567890abcdef12345678",
        "2000",
        "0x",
        "0x",
      )

      await expect(eventBus.publishSync(event, TransferByPartitionDLTEvent.name)).rejects.toThrow(
        BondHolderBalanceNotFoundError.bondHolderPartitionError(
          "0.0.6974684",
          "0.0.7654321", // from (sender)
          "0x0000000000000000000000000000000000000000000000000000000000000001",
        ),
      )
    })

    it("should handle transfers with different partitions", async () => {
      await createTestBond("0.0.6974684")

      const partitions = [
        "0x0000000000000000000000000000000000000000000000000000000000000001",
        "0x0000000000000000000000000000000000000000000000000000000000000002",
      ]

      for (const partition of partitions) {
        await bondHolderBalanceRepository.save({
          bondContractId: "0.0.6974684",
          holderAccountId: "0.0.7654321",
          partition,
          availableBalance: "10000",
          lockedBalance: "0",
        })
      }

      for (const partition of partitions) {
        const event = new TransferByPartitionDLTEvent(
          "0.0.6974684",
          "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
          partition,
          "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
          "0xb3533f32594B689F19A94C608490451478F7197b",
          "0x1234567890abcdef1234567890abcdef12345678",
          "1000",
          "0x",
          "0x",
        )

        await eventBus.publishSync(event, TransferByPartitionDLTEvent.name)

        const senderBalance = await bondHolderBalanceRepository.findOne({
          where: { bondContractId: "0.0.6974684", holderAccountId: "0.0.7654321", partition },
        })
        expect(senderBalance!.availableBalance).toBe("9000")

        const receiverBalance = await bondHolderBalanceRepository.findOne({
          where: { bondContractId: "0.0.6974684", holderAccountId: "0.0.9876543", partition },
        })
        expect(receiverBalance!.availableBalance).toBe("1000")
      }
    })

    it("should convert EVM addresses to Hedera addresses correctly", async () => {
      await createTestBond("0.0.6974684")

      await bondHolderBalanceRepository.save({
        bondContractId: "0.0.6974684",
        holderAccountId: "0.0.7654321",
        partition: "0x0000000000000000000000000000000000000000000000000000000000000001",
        availableBalance: "5000",
        lockedBalance: "0",
      })

      const event = new TransferByPartitionDLTEvent(
        "0.0.6974684",
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        "0x0000000000000000000000000000000000000000000000000000000000000001",
        "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
        "0xb3533f32594B689F19A94C608490451478F7197b",
        "0x1234567890abcdef1234567890abcdef12345678",
        "2000",
        "0x",
        "0x",
      )

      await eventBus.publishSync(event, TransferByPartitionDLTEvent.name)

      const allBalances = await bondHolderBalanceRepository.find()
      allBalances.forEach((balance) => {
        expect(balance.bondContractId).toMatch(/^0\.0\.\d+$/)
        expect(balance.holderAccountId).toMatch(/^0\.0\.\d+$/)
      })
    })

    it("should publish TransferByPartitionEvent after successful transfer", async () => {
      let publishedEvent: any
      jest.spyOn(eventBus, "publish").mockImplementation((event) => (publishedEvent = event))

      await createTestBond("0.0.6974684")

      await bondHolderBalanceRepository.save({
        bondContractId: "0.0.6974684",
        holderAccountId: "0.0.7654321",
        partition: "0x0000000000000000000000000000000000000000000000000000000000000001",
        availableBalance: "5000",
        lockedBalance: "0",
      })

      const event = new TransferByPartitionDLTEvent(
        "0.0.6974684",
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        "0x0000000000000000000000000000000000000000000000000000000000000001",
        "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
        "0xb3533f32594B689F19A94C608490451478F7197b",
        "0x1234567890abcdef1234567890abcdef12345678",
        "2000",
        "0x",
        "0x",
      )

      await eventBus.publishSync(event, TransferByPartitionDLTEvent.name)

      expect(publishedEvent).toEqual(
        expect.objectContaining({
          bondContractId: "0.0.6974684",
          partition: "0x0000000000000000000000000000000000000000000000000000000000000001",
          fromAccountId: "0.0.7654321", // from (sender)
          toAccountId: "0.0.9876543", // to (receiver)
          amount: "2000",
          operatorAccountId: "0.0.1234567", // operator
          timestamp: expect.any(Number),
        }),
      )
    })

    it("should handle multiple transfers in sequence", async () => {
      await createTestBond("0.0.6974684")

      await bondHolderBalanceRepository.save({
        bondContractId: "0.0.6974684",
        holderAccountId: "0.0.7654321",
        partition: "0x0000000000000000000000000000000000000000000000000000000000000001",
        availableBalance: "10000",
        lockedBalance: "0",
      })

      const transfers = [
        { amount: "1000", expectedSender: "9000", expectedReceiver: "1000" },
        { amount: "2000", expectedSender: "7000", expectedReceiver: "3000" },
        { amount: "3000", expectedSender: "4000", expectedReceiver: "6000" },
      ]

      for (const transfer of transfers) {
        const event = new TransferByPartitionDLTEvent(
          "0.0.6974684",
          "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
          "0x0000000000000000000000000000000000000000000000000000000000000001",
          "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
          "0xb3533f32594B689F19A94C608490451478F7197b",
          "0x1234567890abcdef1234567890abcdef12345678",
          transfer.amount,
          "0x",
          "0x",
        )

        await eventBus.publishSync(event, TransferByPartitionDLTEvent.name)

        const senderBalance = await bondHolderBalanceRepository.findOne({
          where: { bondContractId: "0.0.6974684", holderAccountId: "0.0.7654321" },
        })
        expect(senderBalance!.availableBalance).toBe(transfer.expectedSender)

        const receiverBalance = await bondHolderBalanceRepository.findOne({
          where: { bondContractId: "0.0.6974684", holderAccountId: "0.0.9876543" },
        })
        expect(receiverBalance!.availableBalance).toBe(transfer.expectedReceiver)
      }
    })
  })
})
