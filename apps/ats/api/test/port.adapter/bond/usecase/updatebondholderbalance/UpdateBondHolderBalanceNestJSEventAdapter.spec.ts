// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import { CONTROLLERS, PROVIDERS } from "@components"
import { ConverterUtils, EventBus, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "@test/shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"
import { Repository } from "typeorm"
import { getRepositoryToken } from "@nestjs/typeorm"
import { BondHolderBalancePersistence } from "@port/holderbalance/persistence/model/BondHolderBalancePersistence"
import { IssuedByPartitionDLTEvent } from "@port/holderbalance/usecase/updatebondholderbalance/model/IssuedByPartitionDLTEvent"
import { BondPersistence } from "@port/bond/persistence/model/BondPersistence"

describe("UpdateBondHolderBalanceNestJSEventAdapter Integration", () => {
  const CONTRACT_ID = "0.0.6974684"
  const _EVM_CONTRACT_ADDRESS = "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7"
  const HOLDER_ACCOUNT_ID = "0.0.6823801"
  const EVM_HOLDER_ADDRESS = "0x48ca774f6942166bf37e178ccc1e861947ead8c7"
  const PARTITION = "0x7265736572766564000000000000000000000000000000000000000000000000"
  const OPERATOR = "0x48ca774f6942166bf37e178ccc1e861947ead8c7"

  let app: INestApplication
  let eventBus: EventBus
  let bondHolderBalanceRepository: Repository<BondHolderBalancePersistence>
  let bondRepository: Repository<BondPersistence>

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

    await bondRepository.save({
      contractId: CONTRACT_ID,
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

    jest.spyOn(ConverterUtils, "getHederaAddressFromEvm").mockImplementation((address: string) => {
      const addressMap: Record<string, string> = {
        "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7": "0.0.6974684",
        "0x48ca774f6942166bf37e178ccc1e861947ead8c7": "0.0.6823801",
        "0x7cbc6ccef6e569e961341f68afd7547f4c1b2c1b": "0.0.6974345",
      }
      return Promise.resolve(addressMap[address] || "0.0.9999999")
    })
  })
  afterEach(async () => {
    await bondRepository.query('DELETE FROM "Bonds"')
    jest.restoreAllMocks()
    await app.close()
  })

  describe("UpdateBondHolderBalanceNestJSEventAdapter", () => {
    it("should create a new bond holder balance when IssuedByPartitionDLTEvent is published for a new holder", async () => {
      const event = new IssuedByPartitionDLTEvent(
        CONTRACT_ID,
        "0x1234567890abcdef",
        PARTITION,
        OPERATOR,
        EVM_HOLDER_ADDRESS,
        "1000",
        "0x",
      )

      await eventBus.publishSync(event, IssuedByPartitionDLTEvent.name)

      const savedBalance = await bondHolderBalanceRepository.findOne({
        where: {
          bondContractId: CONTRACT_ID,
          holderAccountId: HOLDER_ACCOUNT_ID,
          partition: PARTITION,
        },
      })

      expect(savedBalance).toBeDefined()
      expect(savedBalance).not.toBeNull()
      expect(savedBalance!.bondContractId).toBe(CONTRACT_ID)
      expect(savedBalance!.holderAccountId).toBe(HOLDER_ACCOUNT_ID)
      expect(savedBalance!.partition).toBe(PARTITION)
      expect(savedBalance!.availableBalance).toBe("1000")
      expect(savedBalance!.lockedBalance).toBe("0")
    })

    it("should update existing bond holder balance when IssuedByPartitionDLTEvent is published", async () => {
      await bondHolderBalanceRepository.save({
        bondContractId: CONTRACT_ID,
        holderAccountId: HOLDER_ACCOUNT_ID,
        partition: PARTITION,
        availableBalance: "500",
        lockedBalance: "0",
      })

      const event = new IssuedByPartitionDLTEvent(
        CONTRACT_ID,
        "0x1234567890abcdef",
        PARTITION,
        OPERATOR,
        EVM_HOLDER_ADDRESS,
        "1000",
        "0x",
      )

      await eventBus.publishSync(event, IssuedByPartitionDLTEvent.name)

      const updatedBalance = await bondHolderBalanceRepository.findOne({
        where: {
          bondContractId: CONTRACT_ID,
          holderAccountId: HOLDER_ACCOUNT_ID,
          partition: PARTITION,
        },
      })

      expect(updatedBalance).toBeDefined()
      expect(updatedBalance).not.toBeNull()
      expect(updatedBalance!.availableBalance).toBe("1500")
      expect(updatedBalance!.lockedBalance).toBe("0")
    })

    it("should correctly add multiple amounts to the same holder balance", async () => {
      const amounts = ["100", "250", "150"]
      let expectedTotal = BigInt(0)

      for (const amount of amounts) {
        const event = new IssuedByPartitionDLTEvent(
          CONTRACT_ID,
          "0x1234567890abcdef",
          PARTITION,
          OPERATOR,
          EVM_HOLDER_ADDRESS,
          amount,
          "0x",
        )

        await eventBus.publishSync(event, IssuedByPartitionDLTEvent.name)
        expectedTotal += BigInt(amount)

        const balance = await bondHolderBalanceRepository.findOne({
          where: {
            bondContractId: CONTRACT_ID,
            holderAccountId: HOLDER_ACCOUNT_ID,
            partition: PARTITION,
          },
        })

        expect(balance).toBeDefined()
        expect(balance!.availableBalance).toBe(expectedTotal.toString())
      }
    })

    it("should create separate balances for different partitions", async () => {
      const partition1 = "0x7265736572766564000000000000000000000000000000000000000000000000"
      const partition2 = "0x697373756564000000000000000000000000000000000000000000000000000"

      const event1 = new IssuedByPartitionDLTEvent(
        CONTRACT_ID,
        "0x1234567890abcdef",
        partition1,
        OPERATOR,
        EVM_HOLDER_ADDRESS,
        "1000",
        "0x",
      )

      const event2 = new IssuedByPartitionDLTEvent(
        CONTRACT_ID,
        "0x1234567890abcdef",
        partition2,
        OPERATOR,
        EVM_HOLDER_ADDRESS,
        "2000",
        "0x",
      )

      await eventBus.publishSync(event1, IssuedByPartitionDLTEvent.name)
      await eventBus.publishSync(event2, IssuedByPartitionDLTEvent.name)

      const balance1 = await bondHolderBalanceRepository.findOne({
        where: {
          bondContractId: CONTRACT_ID,
          holderAccountId: HOLDER_ACCOUNT_ID,
          partition: partition1,
        },
      })

      const balance2 = await bondHolderBalanceRepository.findOne({
        where: {
          bondContractId: CONTRACT_ID,
          holderAccountId: HOLDER_ACCOUNT_ID,
          partition: partition2,
        },
      })

      expect(balance1).toBeDefined()
      expect(balance1!.availableBalance).toBe("1000")

      expect(balance2).toBeDefined()
      expect(balance2!.availableBalance).toBe("2000")

      const allBalances = await bondHolderBalanceRepository.find({
        where: {
          bondContractId: CONTRACT_ID,
          holderAccountId: HOLDER_ACCOUNT_ID,
        },
      })
      expect(allBalances).toHaveLength(2)
    })

    it("should create separate balances for different holders", async () => {
      const holder1EvmAddress = "0x48ca774f6942166bf37e178ccc1e861947ead8c7"
      const holder2EvmAddress = "0x7cbc6ccef6e569e961341f68afd7547f4c1b2c1b"
      const holder1AccountId = "0.0.6823801"
      const holder2AccountId = "0.0.6974345"

      const event1 = new IssuedByPartitionDLTEvent(
        CONTRACT_ID,
        "0x1234567890abcdef",
        PARTITION,
        OPERATOR,
        holder1EvmAddress,
        "1000",
        "0x",
      )

      const event2 = new IssuedByPartitionDLTEvent(
        CONTRACT_ID,
        "0x1234567890abcdef",
        PARTITION,
        OPERATOR,
        holder2EvmAddress,
        "2000",
        "0x",
      )

      await eventBus.publishSync(event1, IssuedByPartitionDLTEvent.name)
      await eventBus.publishSync(event2, IssuedByPartitionDLTEvent.name)

      const balance1 = await bondHolderBalanceRepository.findOne({
        where: {
          bondContractId: CONTRACT_ID,
          holderAccountId: holder1AccountId,
          partition: PARTITION,
        },
      })

      const balance2 = await bondHolderBalanceRepository.findOne({
        where: {
          bondContractId: CONTRACT_ID,
          holderAccountId: holder2AccountId,
          partition: PARTITION,
        },
      })

      expect(balance1).toBeDefined()
      expect(balance1!.holderAccountId).toBe(holder1AccountId)
      expect(balance1!.availableBalance).toBe("1000")

      expect(balance2).toBeDefined()
      expect(balance2!.holderAccountId).toBe(holder2AccountId)
      expect(balance2!.availableBalance).toBe("2000")

      const allBalances = await bondHolderBalanceRepository.find({
        where: {
          bondContractId: CONTRACT_ID,
          partition: PARTITION,
        },
      })
      expect(allBalances).toHaveLength(2)
    })

    it("should handle large amounts correctly", async () => {
      const largeAmount = "999999999999999999999999999"

      const event = new IssuedByPartitionDLTEvent(
        CONTRACT_ID,
        "0x1234567890abcdef",
        PARTITION,
        OPERATOR,
        EVM_HOLDER_ADDRESS,
        largeAmount,
        "0x",
      )

      await eventBus.publishSync(event, IssuedByPartitionDLTEvent.name)

      const savedBalance = await bondHolderBalanceRepository.findOne({
        where: {
          bondContractId: CONTRACT_ID,
          holderAccountId: HOLDER_ACCOUNT_ID,
          partition: PARTITION,
        },
      })

      expect(savedBalance).toBeDefined()
      expect(savedBalance!.availableBalance).toBe(largeAmount)
    })

    it("should preserve locked balance when updating available balance", async () => {
      await bondHolderBalanceRepository.save({
        bondContractId: CONTRACT_ID,
        holderAccountId: HOLDER_ACCOUNT_ID,
        partition: PARTITION,
        availableBalance: "500",
        lockedBalance: "250",
      })

      const event = new IssuedByPartitionDLTEvent(
        CONTRACT_ID,
        "0x1234567890abcdef",
        PARTITION,
        OPERATOR,
        EVM_HOLDER_ADDRESS,
        "1000",
        "0x",
      )

      await eventBus.publishSync(event, IssuedByPartitionDLTEvent.name)

      const updatedBalance = await bondHolderBalanceRepository.findOne({
        where: {
          bondContractId: CONTRACT_ID,
          holderAccountId: HOLDER_ACCOUNT_ID,
          partition: PARTITION,
        },
      })

      expect(updatedBalance).toBeDefined()
      expect(updatedBalance!.availableBalance).toBe("1500")
      expect(updatedBalance!.lockedBalance).toBe("250")
    })

    it("should create balances for different contracts independently", async () => {
      const contract1Id = "0.0.6974694"
      const contract2Id = "0.0.6974377"

      await bondRepository.save({
        contractId: contract1Id,
        treasuryId: "0.0.1000002",
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
      await bondRepository.save({
        contractId: contract2Id,
        treasuryId: "0.0.1000003",
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

      const event1 = new IssuedByPartitionDLTEvent(
        contract1Id,
        "0x1234567890abcdef",
        PARTITION,
        OPERATOR,
        EVM_HOLDER_ADDRESS,
        "1000",
        "0x",
      )

      const event2 = new IssuedByPartitionDLTEvent(
        contract2Id,
        "0x1234567890abcdef",
        PARTITION,
        OPERATOR,
        EVM_HOLDER_ADDRESS,
        "2000",
        "0x",
      )

      await eventBus.publishSync(event1, IssuedByPartitionDLTEvent.name)
      await eventBus.publishSync(event2, IssuedByPartitionDLTEvent.name)

      const balance1 = await bondHolderBalanceRepository.findOne({
        where: {
          bondContractId: contract1Id,
          holderAccountId: HOLDER_ACCOUNT_ID,
          partition: PARTITION,
        },
      })

      const balance2 = await bondHolderBalanceRepository.findOne({
        where: {
          bondContractId: contract2Id,
          holderAccountId: HOLDER_ACCOUNT_ID,
          partition: PARTITION,
        },
      })

      expect(balance1).toBeDefined()
      expect(balance1!.bondContractId).toBe(contract1Id)
      expect(balance1!.availableBalance).toBe("1000")

      expect(balance2).toBeDefined()
      expect(balance2!.bondContractId).toBe(contract2Id)
      expect(balance2!.availableBalance).toBe("2000")

      const allBalances = await bondHolderBalanceRepository.find()
      expect(allBalances).toHaveLength(2)
    })

    it("should handle zero amount correctly", async () => {
      const event = new IssuedByPartitionDLTEvent(
        CONTRACT_ID,
        "0x1234567890abcdef",
        PARTITION,
        OPERATOR,
        EVM_HOLDER_ADDRESS,
        "0",
        "0x",
      )

      await eventBus.publishSync(event, IssuedByPartitionDLTEvent.name)

      const savedBalance = await bondHolderBalanceRepository.findOne({
        where: {
          bondContractId: CONTRACT_ID,
          holderAccountId: HOLDER_ACCOUNT_ID,
          partition: PARTITION,
        },
      })

      expect(savedBalance).toBeDefined()
      expect(savedBalance!.availableBalance).toBe("0")
      expect(savedBalance!.lockedBalance).toBe("0")
    })

    it("should correctly convert EVM addresses to Hedera account IDs", async () => {
      const _evmContractAddress = "0x2fc2fdc1eae44f055f73469f4fe05915395c7ff7"
      const evmHolderAddress = "0x48ca774f6942166bf37e178ccc1e861947ead8c7"

      const event = new IssuedByPartitionDLTEvent(
        CONTRACT_ID,
        "0x1234567890abcdef",
        PARTITION,
        OPERATOR,
        evmHolderAddress,
        "1000",
        "0x",
      )

      await eventBus.publishSync(event, IssuedByPartitionDLTEvent.name)

      const savedBalance = await bondHolderBalanceRepository.findOne({
        where: {
          partition: PARTITION,
        },
      })

      expect(savedBalance).toBeDefined()
      expect(savedBalance!.bondContractId).toMatch(/^0\.0\.\d+$/)
      expect(savedBalance!.holderAccountId).toMatch(/^0\.0\.\d+$/)
    })
  })
})
