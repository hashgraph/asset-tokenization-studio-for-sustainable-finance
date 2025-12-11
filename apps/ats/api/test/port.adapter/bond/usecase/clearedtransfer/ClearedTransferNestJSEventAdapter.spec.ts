// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import { CONTROLLERS, PROVIDERS } from "@components"
import { ConverterUtils, EventBus, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "@test/shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"
import { Repository } from "typeorm"
import { getRepositoryToken } from "@nestjs/typeorm"
import { ClearedTransferByPartitionDLTEvent } from "@port/clearing/usecase/clearedtransfer/model/ClearedTransferByPartitionDLTEvent"
import { BondClearingTransferPersistence } from "@port/clearing/persistence/model/BondClearingTransferPersistence"
import { BondPersistence } from "@port/bond/persistence/model/BondPersistence"
import { ClearingTransferFoundError } from "@domain/clearing/errors/ClearingTransferFoundError"
import { ClearingStatus } from "@domain/clearing/model/ClearingStatus"
import { BondHolderBalancePersistence } from "@port/holderbalance/persistence/model/BondHolderBalancePersistence"

describe("ClearedTransferNestJSEventAdapter Integration", () => {
  let app: INestApplication
  let eventBus: EventBus
  let clearingTransferRepository: Repository<BondClearingTransferPersistence>
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
    clearingTransferRepository = app.get(getRepositoryToken(BondClearingTransferPersistence))
    bondRepository = app.get(getRepositoryToken(BondPersistence))
    bondHolderBalanceRepository = app.get(getRepositoryToken(BondHolderBalancePersistence))

    // Mock the ConverterUtils to return consistent Hedera addresses
    jest.spyOn(ConverterUtils, "getHederaAddressFromEvm").mockImplementation((address: string) => {
      const addressMap: Record<string, string> = {
        "0.0.6974684": "0.0.6974684",
        "0.0.1234567": "0.0.1234567",
        "0.0.7654321": "0.0.7654321",
        "0.0.8888888": "0.0.8888888",
      }
      return Promise.resolve(addressMap[address] || "0.0.9999999")
    })
  })
  afterEach(async () => {
    await clearingTransferRepository.clear()
    await bondHolderBalanceRepository.clear()
    await bondRepository.clear()
    jest.restoreAllMocks()
    await app.close()
  })

  describe("ClearedTransferNestJSEventAdapter", () => {
    it("should create a new clearing transfer when ClearedTransferByPartitionDLTEvent is published", async () => {
      await createTestBond("0.0.6974684")

      await bondHolderBalanceRepository.save({
        contractId: "0.0.6974684",
        holderAccountId: "0.0.7654321",
        partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
        availableBalance: "10000",
        lockedBalance: "0",
      })

      const event = new ClearedTransferByPartitionDLTEvent(
        "0.0.6974684",
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        "0.0.1234567",
        "0.0.7654321",
        "0x7265736572766564000000000000000000000000000000000000000000000000",
        "1",
        "1000",
        "1735689600",
        "0.0.8888888",
        "0x1234",
        "0x5678",
      )

      await eventBus.publishSync(event, ClearedTransferByPartitionDLTEvent.name)

      const savedClearing = await clearingTransferRepository.findOne({
        where: { id: 1, bondContractId: "0.0.6974684" },
      })

      expect(savedClearing).toBeDefined()
      expect(savedClearing).not.toBeNull()
      expect(savedClearing!.id).toBe(1)
      expect(savedClearing!.bondContractId).toBe("0.0.6974684")
      expect(savedClearing!.holderAccountId).toBe("0.0.7654321")
      expect(savedClearing!.partition).toBe("0x7265736572766564000000000000000000000000000000000000000000000000")
      expect(savedClearing!.amount).toBe("1000")
      expect(savedClearing!.expirationDate).toEqual(new Date(1735689600 * 1000))
      expect(savedClearing!.status).toBe(ClearingStatus.PENDING)
      expect(savedClearing!.operatorAccountId).toBe("0.0.1234567")
      expect(savedClearing!.toAccountId).toBe("0.0.8888888")
      expect(savedClearing!.data).toBe("0x1234")
      expect(savedClearing!.operatorData).toBe("0x5678")
    })

    it("should throw ClearingTransferFoundError when clearing with same clearingId and bondContractId already exists", async () => {
      await createTestBond("0.0.6974684")

      await bondHolderBalanceRepository.save({
        contractId: "0.0.6974684",
        holderAccountId: "0.0.7654321",
        partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
        availableBalance: "10000",
        lockedBalance: "0",
      })

      const existingClearing = {
        id: 1,
        bondContractId: "0.0.6974684",
        holderAccountId: "0.0.7654321",
        partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
        amount: "500",
        expirationDate: new Date("2024-12-01"),
        status: ClearingStatus.PENDING,
        operatorAccountId: "0.0.1234567",
        toAccountId: "0.0.8888888",
      }

      await clearingTransferRepository.save(existingClearing)

      const event = new ClearedTransferByPartitionDLTEvent(
        "0.0.6974684",
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        "0.0.1234567",
        "0.0.7654321",
        "0x7265736572766564000000000000000000000000000000000000000000000000",
        "1",
        "1000",
        "1735689600",
        "0.0.8888888",
        "0x1234",
        "0x5678",
      )

      await expect(eventBus.publishSync(event, ClearedTransferByPartitionDLTEvent.name)).rejects.toThrow(
        ClearingTransferFoundError,
      )
    })

    it("should create multiple clearing transfers with different clearingIds successfully", async () => {
      await createTestBond("0.0.6974684")

      await bondHolderBalanceRepository.save({
        contractId: "0.0.6974684",
        holderAccountId: "0.0.7654321",
        partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
        availableBalance: "100000",
        lockedBalance: "0",
      })

      const clearingIds = [1, 2, 3]

      for (const clearingId of clearingIds) {
        const event = new ClearedTransferByPartitionDLTEvent(
          "0.0.6974684",
          `0x123456789${clearingId}abcdef1234567890abcdef1234567890abcdef1234567890abcdef`,
          "0.0.1234567",
          "0.0.7654321",
          "0x7265736572766564000000000000000000000000000000000000000000000000",
          clearingId.toString(),
          `${1000 * clearingId}`,
          "1735689600",
          "0.0.8888888",
          "0x1234",
          "0x5678",
        )

        await eventBus.publishSync(event, ClearedTransferByPartitionDLTEvent.name)

        const savedClearing = await clearingTransferRepository.findOne({
          where: { id: clearingId, bondContractId: "0.0.6974684" },
        })

        expect(savedClearing).toBeDefined()
        expect(savedClearing).not.toBeNull()
        expect(savedClearing!.id).toBe(clearingId)
        expect(savedClearing!.amount).toBe(`${1000 * clearingId}`)
      }

      const allClearings = await clearingTransferRepository.find()
      expect(allClearings).toHaveLength(clearingIds.length)
    })

    it("should convert EVM addresses to Hedera addresses correctly", async () => {
      await createTestBond("0.0.6974684")

      await bondHolderBalanceRepository.save({
        contractId: "0.0.6974684",
        holderAccountId: "0.0.7654321",
        partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
        availableBalance: "10000",
        lockedBalance: "0",
      })

      const event = new ClearedTransferByPartitionDLTEvent(
        "0.0.6974684",
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        "0.0.1234567",
        "0.0.7654321",
        "0x7265736572766564000000000000000000000000000000000000000000000000",
        "1",
        "1000",
        "1735689600",
        "0.0.8888888",
        "0x1234",
        "0x5678",
      )

      await eventBus.publishSync(event, ClearedTransferByPartitionDLTEvent.name)

      const savedClearing = await clearingTransferRepository.findOne({
        where: { id: 1, bondContractId: "0.0.6974684" },
      })

      expect(savedClearing).toBeDefined()
      expect(savedClearing!.bondContractId).toMatch(/^0\.0\.\d+$/)
      expect(savedClearing!.holderAccountId).toMatch(/^0\.0\.\d+$/)
      expect(savedClearing!.operatorAccountId).toMatch(/^0\.0\.\d+$/)
    })

    it("should publish ClearingCreatedEvent after successful clearing transfer creation", async () => {
      const publishedEvents: any[] = []
      jest.spyOn(eventBus, "publish").mockImplementation((event) => {
        publishedEvents.push(event)
        void Promise.resolve()
      })

      await createTestBond("0.0.6974684")

      await bondHolderBalanceRepository.save({
        contractId: "0.0.6974684",
        holderAccountId: "0.0.7654321",
        partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
        availableBalance: "10000",
        lockedBalance: "0",
      })

      const event = new ClearedTransferByPartitionDLTEvent(
        "0.0.6974684",
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        "0.0.1234567",
        "0.0.7654321",
        "0x7265736572766564000000000000000000000000000000000000000000000000",
        "1",
        "1000",
        "1735689600",
        "0.0.8888888",
        "0x1234",
        "0x5678",
      )

      await eventBus.publishSync(event, ClearedTransferByPartitionDLTEvent.name)

      expect(publishedEvents.length).toBeGreaterThan(0)
      const clearingCreatedEvent = publishedEvents.find((e) => e.constructor.name === "ClearingCreatedEvent")
      expect(clearingCreatedEvent).toBeDefined()
      expect(clearingCreatedEvent.clearing).toEqual(
        expect.objectContaining({
          id: 1,
          bondContractId: "0.0.6974684",
          holderAccountId: "0.0.7654321",
          partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
          amount: "1000",
          expirationDate: new Date(1735689600 * 1000),
          status: ClearingStatus.PENDING,
          operatorAccountId: "0.0.1234567",
        }),
      )
      expect(clearingCreatedEvent.timestamp).toEqual(expect.any(Number))
    })

    it("should handle different partitions for the same bond", async () => {
      await createTestBond("0.0.6974684")

      const partitions = [
        "0x7265736572766564000000000000000000000000000000000000000000000000",
        "0x6c6f636b65640000000000000000000000000000000000000000000000000000",
      ]

      for (const partition of partitions) {
        await bondHolderBalanceRepository.save({
          contractId: "0.0.6974684",
          holderAccountId: "0.0.7654321",
          partition,
          availableBalance: "10000",
          lockedBalance: "0",
        })
      }

      for (let i = 0; i < partitions.length; i++) {
        const event = new ClearedTransferByPartitionDLTEvent(
          "0.0.6974684",
          `0x123456789${i}abcdef1234567890abcdef1234567890abcdef1234567890abcdef`,
          "0.0.1234567",
          "0.0.7654321",
          partitions[i],
          (i + 1).toString(),
          "1000",
          "1735689600",
          "0.0.8888888",
          "0x1234",
          "0x5678",
        )

        await eventBus.publishSync(event, ClearedTransferByPartitionDLTEvent.name)

        const savedClearing = await clearingTransferRepository.findOne({
          where: { id: i + 1, bondContractId: "0.0.6974684" },
        })

        expect(savedClearing).toBeDefined()
        expect(savedClearing!.partition).toBe(partitions[i])
      }

      const allClearings = await clearingTransferRepository.find()
      expect(allClearings).toHaveLength(partitions.length)
    })
  })
})
