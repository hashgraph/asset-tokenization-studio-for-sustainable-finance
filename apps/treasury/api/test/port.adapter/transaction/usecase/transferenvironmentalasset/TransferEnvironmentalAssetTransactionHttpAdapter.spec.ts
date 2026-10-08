// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import request from "supertest"
import { CONTROLLERS, PROVIDERS } from "../../../../../src/Components"
import { ConverterUtils, SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "../../../../shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"

describe("TransferEnvironmentalAssetTransaction API Integration", () => {
  let app: INestApplication
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SharedModule, PostgresModule.forRoot(PostgreSqlContainer.getWorkerConfig())],
      controllers: CONTROLLERS,
      providers: PROVIDERS,
    }).compile()

    app = moduleFixture.createNestApplication()
    app.setGlobalPrefix("api/v1")
    await app.init()
    jest
      .spyOn(ConverterUtils, "getEvmAddressFromHederaAddress")
      .mockResolvedValue("0x1dC69e700e3fF1Cd7ca407DcCC6f8061D260F1E7")
  })
  afterEach(async () => {
    if (app) {
      await app.close()
    }
  })

  describe("POST /treasuries/:treasuryContractId/environmental-assets/:assetContractId/transfer", () => {
    it("should transfer environmental asset with valid treasuryContractId, assetContractId and tokenId", async () => {
      const treasuryContractId = "0.0.123456"
      const assetContractId = "0.0.789012"
      const transferRequest = {
        format: "hedera",
        accountId: "0.0.123456789",
        tokenId: 1,
        toAccountId: "0.0.987654",
      }

      const response = await request(app.getHttpServer())
        .post(`/api/v1/treasuries/${treasuryContractId}/environmental-assets/${assetContractId}/transfer`)
        .send(transferRequest)
        .expect(201)

      expect(response.body).toHaveProperty("unsignedTx")
      expect(typeof response.body.unsignedTx).toBe("string")
    })

    it("should handle different valid treasuryContractIds, assetContractIds and tokenIds", async () => {
      const testCases = [
        {
          treasuryContractId: "0.0.123456",
          assetContractId: "0.0.789012",
          tokenId: 1,
          toAccountId: "0.0.987654",
        },
        {
          treasuryContractId: "0.0.654321",
          assetContractId: "0.0.210987",
          tokenId: 42,
          toAccountId: "0.0.456789",
        },
        {
          treasuryContractId: "0.0.999999",
          assetContractId: "0.0.111111",
          tokenId: 100,
          toAccountId: "0.0.222222",
        },
      ]

      for (const { treasuryContractId, assetContractId, tokenId, toAccountId } of testCases) {
        const transferRequest = {
          format: "hedera",
          accountId: "0.0.123456789",
          tokenId,
          toAccountId,
        }

        const response = await request(app.getHttpServer())
          .post(`/api/v1/treasuries/${treasuryContractId}/environmental-assets/${assetContractId}/transfer`)
          .send(transferRequest)
          .expect(201)

        expect(response.body).toHaveProperty("unsignedTx")
        expect(typeof response.body.unsignedTx).toBe("string")
      }
    })
  })
})
