// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { HttpStatus, INestApplication } from "@nestjs/common"
import request from "supertest"
import { CONTROLLERS, PROVIDERS } from "../../../../../src/Components"
import { SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "../../../../shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"
import { Repository } from "typeorm"
import { TreasuryPersistence } from "@port/persistence/treasury/model/TreasuryPersistence"
import { getRepositoryToken } from "@nestjs/typeorm"
import { PaymentTokenPersistence } from "@port/persistence/paymenttoken/model/PaymentTokenPersistence"
import { HederaPort } from "@port/blockchain/HederaPort"
import { TreasuryNotFoundError } from "@domain/treasury/errors/TreasuryNotFoundError"

describe("GetTreasury API Integration", () => {
  let app: INestApplication
  let container: PostgreSqlContainer
  let internalTreasuryRepository: Repository<TreasuryPersistence>
  let hederaPort: HederaPort

  beforeAll(async () => {
    container = await PostgreSqlContainer.create()
  })

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SharedModule, PostgresModule.forRoot(container.getConfig())],
      controllers: CONTROLLERS,
      providers: PROVIDERS,
    }).compile()

    app = moduleFixture.createNestApplication()
    app.setGlobalPrefix("api/treasuries")
    await app.init()
    internalTreasuryRepository = app.get(getRepositoryToken(TreasuryPersistence))
    hederaPort = app.get("HederaPort")
  })

  afterAll(async () => {
    await container.stop()
  })

  afterEach(async () => {
    await internalTreasuryRepository.deleteAll()
  })

  describe("GET /:treasuryContractId", () => {
    it("should return treasury with payment token", async () => {
      let treasury = await internalTreasuryRepository.save({
        contractId: "0.0.6625592",
        bondContractId: "0.0.6974684",
        paused: true,
      })
      const paymentToken = {
        contractId: "0.0.5703967",
        treasuryId: treasury.id,
        treasury: treasury,
        removalDate: new Date(),
      } as PaymentTokenPersistence
      treasury.paymentToken = paymentToken
      treasury = await internalTreasuryRepository.save(treasury)
      const balance = "8765.99998"

      jest.spyOn(hederaPort, "getTokenBalance").mockResolvedValue(balance)
      const response = await request(app.getHttpServer())
        .get(`/api/treasuries/${treasury.contractId}`)
        .expect(HttpStatus.OK)

      expect(response.body).toEqual({
        contractId: treasury.contractId,
        bondContractId: treasury.bondContractId,
        paused: treasury.paused,
        paymentToken: {
          contractId: paymentToken.contractId,
          additionDate: paymentToken.createdAt.toISOString(),
          removalDate: paymentToken.removalDate.toISOString(),
          balance,
        },
      })
    })

    it("should return treasury without payment token", async () => {
      const treasury = await internalTreasuryRepository.save({
        contractId: "0.0.6625592",
        bondContractId: "0.0.6974684",
        paused: true,
      })
      const response = await request(app.getHttpServer())
        .get(`/api/treasuries/${treasury.contractId}`)
        .expect(HttpStatus.OK)

      expect(response.body).toEqual({
        contractId: treasury.contractId,
        bondContractId: treasury.bondContractId,
        paused: treasury.paused,
      })
    })

    it("should return Http 404 error when treasury does not exist", async () => {
      const treasuryContractId = "0.0.33454"
      const errorMessage = TreasuryNotFoundError.contractIdError(treasuryContractId).message
      const response = await request(app.getHttpServer())
        .get(`/api/treasuries/${treasuryContractId}`)
        .expect(HttpStatus.NOT_FOUND)

      expect(response.body).toEqual({
        cause: errorMessage,
        message: errorMessage,
        statusCode: HttpStatus.NOT_FOUND,
      })
    })
  })
})
