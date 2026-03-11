// SPDX-License-Identifier: Apache-2.0
import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import { SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgresModule } from "@config/PostgresModule"
import { CONTROLLERS, PROVIDERS } from "@components"
import { PostgreSqlContainer } from "@test/shared/containers/PostgresqlContainer"
import { Repository } from "typeorm"
import { BondProceedRecipientPersistence } from "@port/proceedrecipient/persistence/model/BondProceedRecipientPersistence"
import { getRepositoryToken } from "@nestjs/typeorm"
import { ProceedRecipientRemovedDLTEvent } from "@port/proceedrecipient/usecase/removeproceedrecipient/model/ProceedRecipientRemovedDLTEvent"
import { RemoveProceedRecipientNestJSEventAdapter } from "@port/proceedrecipient/usecase/removeproceedrecipient/RemoveProceedRecipientNestJSEventAdapter"
import { BondPersistence } from "@port/bond/persistence/model/BondPersistence"

describe("RemoveProceedRecipientNestJSEventAdapter", () => {
  let app: INestApplication
  let removeProceedRecipientAdapter: RemoveProceedRecipientNestJSEventAdapter
  let bondProceedRecipientRepository: Repository<BondProceedRecipientPersistence>
  let bondRepository: Repository<BondPersistence>

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SharedModule, PostgresModule.forRoot(PostgreSqlContainer.getWorkerConfig())],
      controllers: CONTROLLERS,
      providers: [...PROVIDERS],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.useLogger(false)
    await app.init()

    removeProceedRecipientAdapter = app.get<RemoveProceedRecipientNestJSEventAdapter>(
      RemoveProceedRecipientNestJSEventAdapter,
    )
    bondProceedRecipientRepository = app.get<Repository<BondProceedRecipientPersistence>>(
      getRepositoryToken(BondProceedRecipientPersistence),
    )
    bondRepository = app.get<Repository<BondPersistence>>(getRepositoryToken(BondPersistence))
  })
  afterEach(async () => {
    if (app) {
      await app.close()
    }
  })

  describe("handle", () => {
    it("should remove proceed recipient when event is received", async () => {
      const contractId = "0.0.12345"
      const proceedRecipient = "0x1234567890123456789012345678901234567890"

      // Create bond first
      await bondRepository.save({
        contractId: contractId,
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

      // First, add a proceed recipient
      await bondProceedRecipientRepository.save({
        bondContractId: contractId,
        proceedRecipientAddress: proceedRecipient,
        data: "0x",
      })

      // Verify it exists
      let recipient = await bondProceedRecipientRepository.findOne({
        where: { bondContractId: contractId, proceedRecipientAddress: proceedRecipient },
      })
      expect(recipient).toBeDefined()

      // Create and handle the remove event
      const event = new ProceedRecipientRemovedDLTEvent(contractId, "0xhash", "0xoperator", proceedRecipient)

      await removeProceedRecipientAdapter.handle(event)

      // Verify it was removed
      recipient = await bondProceedRecipientRepository.findOne({
        where: { bondContractId: contractId, proceedRecipientAddress: proceedRecipient },
      })
      expect(recipient).toBeNull()
    })

    it("should throw error when trying to remove non-existent proceed recipient", async () => {
      const contractId = "0.0.12345"
      const proceedRecipient = "0x1234567890123456789012345678901234567890"

      const event = new ProceedRecipientRemovedDLTEvent(contractId, "0xhash", "0xoperator", proceedRecipient)

      await expect(removeProceedRecipientAdapter.handle(event)).rejects.toThrow()
    })

    it("should handle multiple remove events for different recipients", async () => {
      const contractId = "0.0.54321"
      const recipient1 = "0x1111111111111111111111111111111111111111"
      const recipient2 = "0x2222222222222222222222222222222222222222"

      // Create bond first
      await bondRepository.save({
        contractId: contractId,
        treasuryId: "0.0.2000001",
        name: "Test Bond 2",
        symbol: "TBOND2",
        isin: "US0987654321",
        decimals: 18,
        currency: "USD",
        nominalValue: "1000000000000000000",
        nominalValueDecimals: 18,
        startingDate: new Date("2025-01-01"),
        maturityDate: new Date("2030-01-01"),
        maxSupply: "1000000000000000000000",
        isPaused: false,
      })

      // Add two recipients
      await bondProceedRecipientRepository.save({
        bondContractId: contractId,
        proceedRecipientAddress: recipient1,
        data: "0x",
      })
      await bondProceedRecipientRepository.save({
        bondContractId: contractId,
        proceedRecipientAddress: recipient2,
        data: "0x",
      })

      // Remove first recipient
      const event1 = new ProceedRecipientRemovedDLTEvent(contractId, "0xhash1", "0xoperator", recipient1)
      await removeProceedRecipientAdapter.handle(event1)

      // Verify first is removed, second still exists
      const result1 = await bondProceedRecipientRepository.findOne({
        where: { bondContractId: contractId, proceedRecipientAddress: recipient1 },
      })
      const result2 = await bondProceedRecipientRepository.findOne({
        where: { bondContractId: contractId, proceedRecipientAddress: recipient2 },
      })

      expect(result1).toBeNull()
      expect(result2).toBeDefined()
      expect(result2?.proceedRecipientAddress).toBe(recipient2)
    })
  })
})
