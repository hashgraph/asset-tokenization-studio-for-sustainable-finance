// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import { CONTROLLERS, PROVIDERS } from "@components"
import { ConverterUtils, EventBus, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "@test/shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"
import { Repository } from "typeorm"
import { getRepositoryToken } from "@nestjs/typeorm"
import { ClearedRedeemByPartitionDLTEvent } from "@port/clearing/usecase/clearedredeem/model/ClearedRedeemByPartitionDLTEvent"
import { BondClearingRedeemPersistence } from "@port/clearing/persistence/model/BondClearingRedeemPersistence"
import { BondPersistence } from "@port/bond/persistence/model/BondPersistence"
import { ClearingRedeemFoundError } from "@domain/clearing/errors/ClearingRedeemFoundError"
import { ClearingStatus } from "@domain/clearing/model/ClearingStatus"
import { BondHolderBalancePersistence } from "@port/holderbalance/persistence/model/BondHolderBalancePersistence"

describe("ClearedRedeemNestJSEventAdapter Integration", () => {
  let app: INestApplication
  let container: PostgreSqlContainer
  let eventBus: EventBus
  let clearingRedeemRepository: Repository<BondClearingRedeemPersistence>
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

  beforeAll(async () => {
    container = await PostgreSqlContainer.create()
  })

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SharedModule, PostgresModule.forRoot(container.getConfig())],
      controllers: CONTROLLERS,
      providers: [...PROVIDERS],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
    eventBus = app.get("EventBus")
    clearingRedeemRepository = app.get(getRepositoryToken(BondClearingRedeemPersistence))
    bondRepository = app.get(getRepositoryToken(BondPersistence))
    bondHolderBalanceRepository = app.get(getRepositoryToken(BondHolderBalancePersistence))

    jest.spyOn(ConverterUtils, "getHederaAddressFromEvm").mockImplementation((address: string) => {
      const addressMap: Record<string, string> = {
        "0.0.6974684": "0.0.6974684",
        "0.0.1234567": "0.0.1234567",
        "0.0.7654321": "0.0.7654321",
      }
      return Promise.resolve(addressMap[address] || "0.0.9999999")
    })
  })

  afterAll(async () => {
    await container.stop()
  })

  afterEach(async () => {
    await clearingRedeemRepository.clear()
    await bondHolderBalanceRepository.clear()
    await bondRepository.clear()
    jest.restoreAllMocks()
    await app.close()
  })

  describe("ClearedRedeemNestJSEventAdapter", () => {
    it("should create a new clearing redeem when ClearedRedeemByPartitionDLTEvent is published", async () => {
      await createTestBond("0.0.6974684")

      await bondHolderBalanceRepository.save({
        contractId: "0.0.6974684",
        holderAccountId: "0.0.7654321",
        partition: "0x7265736572766564000000000000000000000000000000000000000000000000",
        availableBalance: "10000",
        lockedBalance: "0",
      })

      const event = new ClearedRedeemByPartitionDLTEvent(
        "0.0.6974684",
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        "0.0.1234567",
        "0.0.7654321",
        "0x7265736572766564000000000000000000000000000000000000000000000000",
        "1",
        "1000",
        "1735689600",
        "0x1234",
        "0x5678",
      )

      await eventBus.publishSync(event, ClearedRedeemByPartitionDLTEvent.name)

      const savedClearing = await clearingRedeemRepository.findOne({
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
      expect(savedClearing!.data).toBe("0x1234")
      expect(savedClearing!.operatorData).toBe("0x5678")
    })

    it("should throw ClearingRedeemFoundError when clearing redeem with same clearingId and bondContractId already exists", async () => {
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
      }

      await clearingRedeemRepository.save(existingClearing)

      const event = new ClearedRedeemByPartitionDLTEvent(
        "0.0.6974684",
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        "0.0.1234567",
        "0.0.7654321",
        "0x7265736572766564000000000000000000000000000000000000000000000000",
        "1",
        "1000",
        "1735689600",
        "0x1234",
        "0x5678",
      )

      await expect(eventBus.publishSync(event, ClearedRedeemByPartitionDLTEvent.name)).rejects.toThrow(
        ClearingRedeemFoundError,
      )
    })

    it("should create multiple clearing redeems with different clearingIds successfully", async () => {
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
        const event = new ClearedRedeemByPartitionDLTEvent(
          "0.0.6974684",
          `0x123456789${clearingId}abcdef1234567890abcdef1234567890abcdef1234567890abcdef`,
          "0.0.1234567",
          "0.0.7654321",
          "0x7265736572766564000000000000000000000000000000000000000000000000",
          clearingId.toString(),
          `${1000 * clearingId}`,
          "1735689600",
          "0x1234",
          "0x5678",
        )

        await eventBus.publishSync(event, ClearedRedeemByPartitionDLTEvent.name)

        const savedClearing = await clearingRedeemRepository.findOne({
          where: { id: clearingId, bondContractId: "0.0.6974684" },
        })

        expect(savedClearing).toBeDefined()
        expect(savedClearing).not.toBeNull()
        expect(savedClearing!.id).toBe(clearingId)
        expect(savedClearing!.amount).toBe(`${1000 * clearingId}`)
      }

      const allClearings = await clearingRedeemRepository.find()
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

      const event = new ClearedRedeemByPartitionDLTEvent(
        "0.0.6974684",
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        "0.0.1234567",
        "0.0.7654321",
        "0x7265736572766564000000000000000000000000000000000000000000000000",
        "1",
        "1000",
        "1735689600",
        "0x1234",
        "0x5678",
      )

      await eventBus.publishSync(event, ClearedRedeemByPartitionDLTEvent.name)

      const savedClearing = await clearingRedeemRepository.findOne({
        where: { id: 1, bondContractId: "0.0.6974684" },
      })

      expect(savedClearing).toBeDefined()
      expect(savedClearing!.bondContractId).toMatch(/^0\.0\.\d+$/)
      expect(savedClearing!.holderAccountId).toMatch(/^0\.0\.\d+$/)
      expect(savedClearing!.operatorAccountId).toMatch(/^0\.0\.\d+$/)
    })

    it("should publish ClearingRedeemCreatedEvent after successful clearing redeem creation", async () => {
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

      const event = new ClearedRedeemByPartitionDLTEvent(
        "0.0.6974684",
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        "0.0.1234567",
        "0.0.7654321",
        "0x7265736572766564000000000000000000000000000000000000000000000000",
        "1",
        "1000",
        "1735689600",
        "0x1234",
        "0x5678",
      )

      await eventBus.publishSync(event, ClearedRedeemByPartitionDLTEvent.name)

      expect(publishedEvents.length).toBeGreaterThan(0)
      const clearingRedeemCreatedEvent = publishedEvents.find(
        (e) => e.constructor.name === "ClearingRedeemCreatedEvent",
      )
      expect(clearingRedeemCreatedEvent).toBeDefined()
      expect(clearingRedeemCreatedEvent.clearing).toEqual(
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
      expect(clearingRedeemCreatedEvent.timestamp).toEqual(expect.any(Number))
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
        const event = new ClearedRedeemByPartitionDLTEvent(
          "0.0.6974684",
          `0x123456789${i}abcdef1234567890abcdef1234567890abcdef1234567890abcdef`,
          "0.0.1234567",
          "0.0.7654321",
          partitions[i],
          (i + 1).toString(),
          "1000",
          "1735689600",
          "0x1234",
          "0x5678",
        )

        await eventBus.publishSync(event, ClearedRedeemByPartitionDLTEvent.name)

        const savedClearing = await clearingRedeemRepository.findOne({
          where: { id: i + 1, bondContractId: "0.0.6974684" },
        })

        expect(savedClearing).toBeDefined()
        expect(savedClearing!.partition).toBe(partitions[i])
      }

      const allClearings = await clearingRedeemRepository.find()
      expect(allClearings).toHaveLength(partitions.length)
    })
  })
})
