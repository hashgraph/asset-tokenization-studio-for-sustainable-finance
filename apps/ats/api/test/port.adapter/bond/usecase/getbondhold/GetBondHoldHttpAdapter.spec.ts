// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { HttpStatus, INestApplication } from "@nestjs/common"
import request from "supertest"
import { CONTROLLERS, PROVIDERS } from "../../../../../src/Components"
import { SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "../../../../shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"
import { Repository } from "typeorm"
import { getRepositoryToken } from "@nestjs/typeorm"
import { BondPersistence } from "@port/bond/persistence/model/BondPersistence"
import { BondHoldPersistence } from "@port/bond/persistence/model/BondHoldPersistence"

describe("GetBondHoldHttpAdapter API Integration", () => {
  let app: INestApplication
  let container: PostgreSqlContainer
  let bondRepository: Repository<BondPersistence>
  let bondHoldRepository: Repository<BondHoldPersistence>

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
    app.setGlobalPrefix("api/v1/ats")
    app.useLogger(false)
    await app.init()
    bondRepository = app.get(getRepositoryToken(BondPersistence))
    bondHoldRepository = app.get(getRepositoryToken(BondHoldPersistence))
  })

  afterAll(async () => {
    await container.stop()
  })

  afterEach(async () => {
    if (bondHoldRepository) {
      await bondHoldRepository.clear()
    }
    if (bondRepository) {
      await bondRepository.clear()
    }
    if (app) {
      await app.close()
    }
  })

  describe("GET /:bondContractId/holders/:holderAccountId/holds/:holdId", () => {
    const createBond = async (contractId: string) => {
      await bondRepository.save({
        contractId: contractId,
        treasuryId: contractId,
        kpiId: contractId,
        name: "Test Bond",
        symbol: "TEST",
        decimals: 18,
        currency: "USD",
        nominalValue: "1000",
        nominalValueDecimals: 2,
        startingDate: new Date("2025-01-01"),
        maturityDate: new Date("2030-01-01"),
        maxSupply: "1000000",
        isin: "US0000000000",
      })
    }

    it("should return 404 when bond does not exist", async () => {
      const bondContractId = "0.0.9999999"
      const holderAccountId = "0.0.1001"
      const holdId = 1

      await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/partitions/testPartition/holds/${holdId}`)
        .send()
        .expect(HttpStatus.NOT_FOUND)
    })

    it("should return 404 when hold does not exist", async () => {
      const bondContractId = "0.0.6823801"
      const holderAccountId = "0.0.1001"
      const holdId = 999
      await createBond(bondContractId)

      await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/partitions/testPartition/holds/${holdId}`)
        .send()
        .expect(HttpStatus.NOT_FOUND)
    })

    it("should return hold details when hold exists", async () => {
      const bondContractId = "0.0.6823801"
      const holderAccountId = "0.0.1001"
      await createBond(bondContractId)

      const expirationTimestamp = new Date("2026-06-01")
      const hold = await bondHoldRepository.save({
        id: 1,
        contractId: bondContractId,
        holderAccountId: holderAccountId,
        partition: "default",
        amount: "5000",
        expirationTimestamp: expirationTimestamp,
        escrowAccountId: "0.0.2001",
        toAccountId: "0.0.3001",
        data: "hold data",
        operatorData: "operator data",
        operatorAccountId: "0.0.4001",
      })

      const response = await request(app.getHttpServer())
        .get(
          `/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/partitions/${hold.partition}/holds/${hold.id}`,
        )
        .send()
        .expect(HttpStatus.OK)

      expect(response.body.id).toBe(hold.id)
      expect(response.body.contractId).toBe(bondContractId)
      expect(response.body.holderAccountId).toBe(holderAccountId)
      expect(response.body.partition).toBe("default")
      expect(response.body.amount).toBe("5000")
      expect(response.body.escrowAccountId).toBe("0.0.2001")
      expect(response.body.toAccountId).toBe("0.0.3001")
      expect(response.body.data).toBe("hold data")
      expect(response.body.operatorData).toBe("operator data")
      expect(response.body.operatorAccountId).toBe("0.0.4001")
      expect(new Date(response.body.expirationTimestamp).toISOString()).toBe(expirationTimestamp.toISOString())
      expect(response.body.createdAt).toBeDefined()
      expect(response.body.updatedAt).toBeDefined()
    })

    it("should return 404 when requesting hold of different holder", async () => {
      const bondContractId = "0.0.6823801"
      const holder1 = "0.0.1001"
      const holder2 = "0.0.1002"
      await createBond(bondContractId)

      const hold = await bondHoldRepository.save({
        id: 1,
        contractId: bondContractId,
        holderAccountId: holder1,
        partition: "default",
        amount: "1000",
        expirationTimestamp: new Date("2026-06-01"),
        escrowAccountId: "0.0.2001",
        toAccountId: "0.0.3001",
        data: "",
        operatorData: "",
        operatorAccountId: "",
      })

      // Try to access holder1's hold with holder2 in the URL
      await request(app.getHttpServer())
        .get(`/api/v1/ats/bonds/${bondContractId}/holders/${holder2}/partitions/${hold.partition}/holds/${hold.id}`)
        .send()
        .expect(HttpStatus.NOT_FOUND)
    })

    it("should return 404 when requesting hold from different bond", async () => {
      const bondContractId1 = "0.0.6823801"
      const bondContractId2 = "0.0.6823802"
      const holderAccountId = "0.0.1001"
      await createBond(bondContractId1)
      await createBond(bondContractId2)

      const hold = await bondHoldRepository.save({
        id: 1,
        contractId: bondContractId1,
        holderAccountId: holderAccountId,
        partition: "default",
        amount: "1000",
        expirationTimestamp: new Date("2026-06-01"),
        escrowAccountId: "0.0.2001",
        toAccountId: "0.0.3001",
        data: "",
        operatorData: "",
        operatorAccountId: "",
      })

      // Try to access bond1's hold with bond2 in the URL
      await request(app.getHttpServer())
        .get(
          `/api/v1/ats/bonds/${bondContractId2}/holders/${holderAccountId}/partitions/${hold.partition}/holds/${hold.id}`,
        )
        .send()
        .expect(HttpStatus.NOT_FOUND)
    })

    it("should return 400 for invalid holdId format", async () => {
      const bondContractId = "0.0.6823801"
      const holderAccountId = "0.0.1001"
      const invalidHoldId = "invalid"

      await request(app.getHttpServer())
        .get(
          `/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/partitions/somePartition/holds/${invalidHoldId}`,
        )
        .send()
        .expect(HttpStatus.BAD_REQUEST)
    })

    it("should return hold with all fields including optional ones", async () => {
      const bondContractId = "0.0.6823801"
      const holderAccountId = "0.0.1001"
      await createBond(bondContractId)

      const expirationTimestamp = new Date("2026-06-01")
      const hold = await bondHoldRepository.save({
        id: 1,
        contractId: bondContractId,
        holderAccountId: holderAccountId,
        partition: "partition123",
        amount: "7500",
        expirationTimestamp: expirationTimestamp,
        escrowAccountId: "0.0.2001",
        toAccountId: "0.0.3001",
        data: "custom hold data",
        operatorData: "custom operator data",
        operatorAccountId: "0.0.4001",
      })

      const response = await request(app.getHttpServer())
        .get(
          `/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/partitions/${hold.partition}/holds/${hold.id}`,
        )
        .send()
        .expect(HttpStatus.OK)

      expect(response.body).toMatchObject({
        id: hold.id,
        contractId: bondContractId,
        holderAccountId: holderAccountId,
        partition: "partition123",
        amount: "7500",
        escrowAccountId: "0.0.2001",
        toAccountId: "0.0.3001",
        data: "custom hold data",
        operatorData: "custom operator data",
        operatorAccountId: "0.0.4001",
      })
    })

    it("should return hold with empty optional fields", async () => {
      const bondContractId = "0.0.6823801"
      const holderAccountId = "0.0.1001"
      await createBond(bondContractId)

      const hold = await bondHoldRepository.save({
        id: 1,
        contractId: bondContractId,
        holderAccountId: holderAccountId,
        partition: "default",
        amount: "1000",
        expirationTimestamp: new Date("2026-06-01"),
        escrowAccountId: "0.0.2001",
        toAccountId: "0.0.3001",
        data: "",
        operatorData: "",
        operatorAccountId: "",
      })

      const response = await request(app.getHttpServer())
        .get(
          `/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/partitions/${hold.partition}/holds/${hold.id}`,
        )
        .send()
        .expect(HttpStatus.OK)

      expect(response.body.data).toBe("")
      expect(response.body.operatorData).toBe("")
      expect(response.body.operatorAccountId).toBe("")
    })

    it("should return the correct hold when multiple holds exist", async () => {
      const bondContractId = "0.0.6823801"
      const holderAccountId = "0.0.1001"
      await createBond(bondContractId)

      const expirationTimestamp = new Date("2026-06-01")
      await bondHoldRepository.save({
        id: 1,
        contractId: bondContractId,
        holderAccountId: holderAccountId,
        partition: "partition1",
        amount: "1000",
        expirationTimestamp: expirationTimestamp,
        escrowAccountId: "0.0.2001",
        toAccountId: "0.0.3001",
        data: "data1",
        operatorData: "",
        operatorAccountId: "",
      })

      const hold2 = await bondHoldRepository.save({
        id: 2,
        contractId: bondContractId,
        holderAccountId: holderAccountId,
        partition: "partition2",
        amount: "2000",
        expirationTimestamp: expirationTimestamp,
        escrowAccountId: "0.0.2002",
        toAccountId: "0.0.3002",
        data: "data2",
        operatorData: "",
        operatorAccountId: "",
      })

      await bondHoldRepository.save({
        id: 3,
        contractId: bondContractId,
        holderAccountId: holderAccountId,
        partition: "partition3",
        amount: "3000",
        expirationTimestamp: expirationTimestamp,
        escrowAccountId: "0.0.2003",
        toAccountId: "0.0.3003",
        data: "data3",
        operatorData: "",
        operatorAccountId: "",
      })

      // Request hold2
      const response = await request(app.getHttpServer())
        .get(
          `/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/partitions/${hold2.partition}/holds/${hold2.id}`,
        )
        .send()
        .expect(HttpStatus.OK)

      expect(response.body.id).toBe(hold2.id)
      expect(response.body.partition).toBe("partition2")
      expect(response.body.amount).toBe("2000")
      expect(response.body.data).toBe("data2")
    })

    it("should handle large hold amounts", async () => {
      const bondContractId = "0.0.6823801"
      const holderAccountId = "0.0.1001"
      await createBond(bondContractId)

      const largeAmount = "999999999999999999999999"
      const hold = await bondHoldRepository.save({
        id: 1,
        contractId: bondContractId,
        holderAccountId: holderAccountId,
        partition: "default",
        amount: largeAmount,
        expirationTimestamp: new Date("2026-06-01"),
        escrowAccountId: "0.0.2001",
        toAccountId: "0.0.3001",
        data: "",
        operatorData: "",
        operatorAccountId: "",
      })

      const response = await request(app.getHttpServer())
        .get(
          `/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/partitions/${hold.partition}/holds/${hold.id}`,
        )
        .send()
        .expect(HttpStatus.OK)

      expect(response.body.amount).toBe(largeAmount)
    })
  })
})
