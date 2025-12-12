// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import { CONTROLLERS, PROVIDERS } from "@components"
import { ConverterUtils, EventBus, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "@test/shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"
import { Repository } from "typeorm"
import { getRepositoryToken } from "@nestjs/typeorm"
import { RedeemedByPartitionDLTEvent } from "@port/holderbalance/usecase/redeembondholderbalance/model/RedeemedByPartitionDLTEvent"
import { BondPersistence } from "@port/bond/persistence/model/BondPersistence"
import { BondHolderBalancePersistence } from "@port/holderbalance/persistence/model/BondHolderBalancePersistence"
import { BondHolderBalanceNotFoundError } from "@domain/holderbalance/errors/BondHolderBalanceNotFoundError"
import { InsufficientBondHolderBalanceError } from "@domain/holderbalance/errors/InsufficientBondHolderBalanceError"

describe("RedeemBondHolderBalanceNestJSEventAdapter Integration", () => {
  let app: INestApplication
  let eventBus: EventBus
  let bondRepository: Repository<BondPersistence>
  let bondHolderBalanceRepository: Repository<BondHolderBalancePersistence>

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
    bondRepository = app.get(getRepositoryToken(BondPersistence))
    bondHolderBalanceRepository = app.get(getRepositoryToken(BondHolderBalancePersistence))

    // Mock the ConverterUtils to return consistent Hedera addresses
    jest.spyOn(ConverterUtils, "getHederaAddressFromEvm").mockImplementation((address: string) => {
      const addressMap: Record<string, string> = {
        "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7": "0.0.6974684",
        "0x48ca774f6942166bf37e178ccc1e861947ead8c7": "0.0.1234567",
        "0xb3533f32594B689F19A94C608490451478F7197b": "0.0.7654321",
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

  describe("RedeemBondHolderBalanceNestJSEventAdapter", () => {
    it("should redeem bond holder balance when RedeemedByPartitionDLTEvent is published", async () => {
      await createTestBond("0.0.6974684")

      await bondHolderBalanceRepository.save({
        bondContractId: "0.0.6974684",
        holderAccountId: "0.0.7654321",
        partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
        availableBalance: "10000",
        lockedBalance: "0",
      })

      const event = new RedeemedByPartitionDLTEvent(
        "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        "0x7265736572766564000000000000000000000000000000000000000000000000",
        "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
        "0xb3533f32594B689F19A94C608490451478F7197b",
        "1000",
        "0x",
        "0x",
      )

      await eventBus.publishSync(event, RedeemedByPartitionDLTEvent.name)

      const updatedBalance = await bondHolderBalanceRepository.findOne({
        where: {
          bondContractId: "0.0.6974684",
          holderAccountId: "0.0.7654321",
          partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
        },
      })

      expect(updatedBalance).toBeDefined()
      expect(updatedBalance!.availableBalance).toBe("9000")
      expect(updatedBalance!.lockedBalance).toBe("0")
    })

    it("should throw BondHolderBalanceNotFoundError when bond holder balance does not exist", async () => {
      await createTestBond("0.0.6974684")

      const event = new RedeemedByPartitionDLTEvent(
        "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        "0x7265736572766564000000000000000000000000000000000000000000000000",
        "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
        "0xb3533f32594B689F19A94C608490451478F7197b",
        "1000",
        "0x",
        "0x",
      )

      await expect(eventBus.publishSync(event, RedeemedByPartitionDLTEvent.name)).rejects.toThrow(
        BondHolderBalanceNotFoundError.bondHolderPartitionError(
          "0.0.6974684",
          "0.0.7654321",
          "0x7265736572766564000000000000000000000000000000000000000000000000",
        ),
      )
    })

    it("should throw InsufficientBondHolderBalanceError when insufficient balance", async () => {
      await createTestBond("0.0.6974684")

      await bondHolderBalanceRepository.save({
        bondContractId: "0.0.6974684",
        holderAccountId: "0.0.7654321",
        partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
        availableBalance: "500",
        lockedBalance: "0",
      })

      const event = new RedeemedByPartitionDLTEvent(
        "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        "0x7265736572766564000000000000000000000000000000000000000000000000",
        "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
        "0xb3533f32594B689F19A94C608490451478F7197b",
        "1000",
        "0x",
        "0x",
      )

      await expect(eventBus.publishSync(event, RedeemedByPartitionDLTEvent.name)).rejects.toThrow(
        InsufficientBondHolderBalanceError.bondHolderPartitionError(
          "0.0.6974684",
          "0.0.7654321",
          "0x7265736572766564000000000000000000000000000000000000000000000000",
          "500",
          "1000",
        ),
      )
    })

    it("should redeem multiple times successfully", async () => {
      await createTestBond("0.0.6974684")

      await bondHolderBalanceRepository.save({
        bondContractId: "0.0.6974684",
        holderAccountId: "0.0.7654321",
        partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
        availableBalance: "10000",
        lockedBalance: "0",
      })

      const redeemAmounts = ["1000", "2000", "3000"]

      for (const amount of redeemAmounts) {
        const event = new RedeemedByPartitionDLTEvent(
          "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
          "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
          "0x7265736572766564000000000000000000000000000000000000000000000000",
          "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
          "0xb3533f32594B689F19A94C608490451478F7197b",
          amount,
          "0x",
          "0x",
        )

        await eventBus.publishSync(event, RedeemedByPartitionDLTEvent.name)
      }

      const updatedBalance = await bondHolderBalanceRepository.findOne({
        where: {
          bondContractId: "0.0.6974684",
          holderAccountId: "0.0.7654321",
          partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
        },
      })

      expect(updatedBalance!.availableBalance).toBe("4000")
      expect(updatedBalance!.lockedBalance).toBe("0")
    })

    it("should convert EVM addresses to Hedera addresses correctly", async () => {
      await createTestBond("0.0.6974684")

      await bondHolderBalanceRepository.save({
        bondContractId: "0.0.6974684",
        holderAccountId: "0.0.7654321",
        partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
        availableBalance: "10000",
        lockedBalance: "0",
      })

      const converterSpy = jest.mocked(ConverterUtils.getHederaAddressFromEvm)

      const event = new RedeemedByPartitionDLTEvent(
        "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        "0x7265736572766564000000000000000000000000000000000000000000000000",
        "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
        "0xb3533f32594B689F19A94C608490451478F7197b",
        "1000",
        "0x",
        "0x",
      )

      await eventBus.publishSync(event, RedeemedByPartitionDLTEvent.name)

      expect(converterSpy).toHaveBeenCalledWith("0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7")
      expect(converterSpy).toHaveBeenCalledWith("0xb3533f32594B689F19A94C608490451478F7197b")
    })

    it("should publish RedeemedBondHolderBalanceEvent after successful redemption", async () => {
      let publishedEvent: any
      jest.spyOn(eventBus, "publish").mockImplementation((event) => (publishedEvent = event))

      await createTestBond("0.0.6974684")

      await bondHolderBalanceRepository.save({
        bondContractId: "0.0.6974684",
        holderAccountId: "0.0.7654321",
        partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
        availableBalance: "10000",
        lockedBalance: "0",
      })

      const event = new RedeemedByPartitionDLTEvent(
        "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        "0x7265736572766564000000000000000000000000000000000000000000000000",
        "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
        "0xb3533f32594B689F19A94C608490451478F7197b",
        "1000",
        "0x",
        "0x",
      )

      await eventBus.publishSync(event, RedeemedByPartitionDLTEvent.name)

      expect(publishedEvent).toEqual(
        expect.objectContaining({
          bondContractId: "0.0.6974684",
          holderAccountId: "0.0.7654321",
          partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
          amount: "1000",
          timestamp: expect.any(Number),
        }),
      )
    })

    it("should handle different partitions for the same bond", async () => {
      await createTestBond("0.0.6974684")

      const partitions = [
        "0x7265736572766564000000000000000000000000000000000000000000000000",
        "0x6c6f636b65640000000000000000000000000000000000000000000000000000",
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
        const event = new RedeemedByPartitionDLTEvent(
          "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7",
          "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
          partition,
          "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
          "0xb3533f32594B689F19A94C608490451478F7197b",
          "1000",
          "0x",
          "0x",
        )

        await eventBus.publishSync(event, RedeemedByPartitionDLTEvent.name)
      }

      for (const partition of partitions) {
        const updatedBalance = await bondHolderBalanceRepository.findOne({
          where: {
            bondContractId: "0.0.6974684",
            holderAccountId: "0.0.7654321",
            partition,
          },
        })

        expect(updatedBalance!.availableBalance).toBe("9000")
      }
    })
  })
})
