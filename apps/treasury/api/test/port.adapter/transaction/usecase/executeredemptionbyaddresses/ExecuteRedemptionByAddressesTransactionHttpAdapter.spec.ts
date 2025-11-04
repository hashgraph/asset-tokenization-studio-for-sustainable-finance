// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import request from "supertest"
import { CONTROLLERS, PROVIDERS } from "../../../../../src/Components"
import { ConverterUtils, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "../../../../shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"
import { Repository } from "typeorm"
import { TreasuryPersistence } from "@port/persistence/treasury/model/TreasuryPersistence"
import { getRepositoryToken } from "@nestjs/typeorm"
import { TreasuryNotFoundError } from "@domain/treasury/errors/TreasuryNotFoundError"

describe("ExecuteRedemptionByAddressesTransaction API Integration", () => {
  let app: INestApplication
  let container: PostgreSqlContainer
  let internalTreasuryRepository: Repository<TreasuryPersistence>

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
    app.setGlobalPrefix("api/v1")
    await app.init()
    internalTreasuryRepository = app.get(getRepositoryToken(TreasuryPersistence))
    jest
      .spyOn(ConverterUtils, "getEvmAddressFromHederaAddress")
      .mockResolvedValue("0x1dC69e700e3fF1Cd7ca407DcCC6f8061D260F1E7")
  })

  afterAll(async () => {
    await container.stop()
  })

  afterEach(async () => {
    await internalTreasuryRepository.deleteAll()
    delete process.env.MAX_BATCH_SIZE
  })

  describe("POST /treasuries/:treasuryContractId/redemptions/holders", () => {
    it("should return redemption execution by addresses transactions in hedera format", async () => {
      const treasury = await internalTreasuryRepository.save({
        contractId: "0.0.6625592",
        bondContractId: "0.0.6974684",
        paused: false,
      })
      const redemptionRequest = {
        format: "hedera",
        accountId: "0.0.123456789",
        maxBatchSize: 2,
        holdersAccountIds: ["0.0.12345", "0.0.48983", "0.0.33344"],
      }

      const response = await request(app.getHttpServer())
        .post(`/api/v1/treasuries/${treasury.contractId}/redemptions/holders`)
        .send(redemptionRequest)
        .expect(201)

      expect(response.body).toEqual({
        items: expect.arrayOf(expect.any(String)),
      })
      expect(response.body.items).toHaveLength(2)
    })

    it("should return redemption execution by addresses transactions in ethereum format", async () => {
      const treasury = await internalTreasuryRepository.save({
        contractId: "0.0.6625592",
        bondContractId: "0.0.6974684",
        paused: false,
      })
      const redemptionRequest = {
        format: "ethereum",
        accountId: "0.0.123456789",
        maxBatchSize: 2,
        holdersAccountIds: ["0.0.12345", "0.0.48983", "0.0.33344"],
      }

      const response = await request(app.getHttpServer())
        .post(`/api/v1/treasuries/${treasury.contractId}/redemptions/holders`)
        .send(redemptionRequest)
        .expect(201)

      expect(response.body).toEqual({
        items: expect.arrayOf(expect.any(String)),
      })
      expect(response.body.items).toHaveLength(2)
    })

    it("should return 1 transaction when addresses size is lest than max batch size", async () => {
      const treasury = await internalTreasuryRepository.save({
        contractId: "0.0.6625592",
        bondContractId: "0.0.6974684",
        paused: false,
      })
      const redemptionRequest = {
        format: "hedera",
        accountId: "0.0.123456789",
        maxBatchSize: 4,
        holdersAccountIds: ["0.0.12345", "0.0.48983", "0.0.33344"],
      }

      const response = await request(app.getHttpServer())
        .post(`/api/v1/treasuries/${treasury.contractId}/redemptions/holders`)
        .send(redemptionRequest)
        .expect(201)

      expect(response.body).toEqual({
        items: expect.arrayOf(expect.any(String)),
      })
      expect(response.body.items).toHaveLength(1)
    })

    it("should return redemption execution by addresses transactions using configured max batch size", async () => {
      const treasury = await internalTreasuryRepository.save({
        contractId: "0.0.6625592",
        bondContractId: "0.0.6974684",
        paused: false,
      })
      const redemptionRequest = {
        format: "hedera",
        accountId: "0.0.123456789",
        holdersAccountIds: ["0.0.12345", "0.0.48983", "0.0.33344"],
      }
      process.env.MAX_BATCH_SIZE = 2

      const response = await request(app.getHttpServer())
        .post(`/api/v1/treasuries/${treasury.contractId}/redemptions/holders`)
        .send(redemptionRequest)
        .expect(201)

      expect(response.body).toEqual({
        items: expect.arrayOf(expect.any(String)),
      })
      expect(response.body.items).toHaveLength(2)
    })

    it("should throw error if treasury does not exist", async () => {
      const treasuryContractId = "0.0.6625592"
      const redemptionRequest = {
        format: "hedera",
        accountId: "0.0.123456789",
        maxBatchSize: 5,
        holdersAccountIds: ["0.0.12345", "0.0.48983", "0.0.33344"],
      }
      const errorMessage = TreasuryNotFoundError.contractIdError(treasuryContractId).message

      const response = await request(app.getHttpServer())
        .post(`/api/v1/treasuries/${treasuryContractId}/redemptions/holders`)
        .send(redemptionRequest)
        .expect(404)

      expect(response.body).toEqual({
        cause: errorMessage,
        message: errorMessage,
        statusCode: 404,
      })
    })
  })
})
