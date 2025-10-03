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

describe("GetTreasuryPositionsHttpAdapter API Integration", () => {
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
    app.setGlobalPrefix("api/v1/treasury")
    await app.init()
    internalTreasuryRepository = app.get(getRepositoryToken(TreasuryPersistence))
  })

  afterAll(async () => {
    await container.stop()
  })

  afterEach(async () => {
    if (app) {
      await app.close()
    }
  })

  describe("POST /bonds/:bondContractAddress/positions", () => {
    it("should return 404 Http error when treasury is not found", async () => {
      const bondContractAddress = "0x1234567890abcdef1234567890abcdef12345678"

      await request(app.getHttpServer())
        .get(`/api/v1/treasury/bonds/${bondContractAddress}/positions`)
        .send()
        .expect(HttpStatus.NOT_FOUND)
    })

    it("should return treasury positions", async () => {
      const treasury = await internalTreasuryRepository.save({
        contractAddress: "0x82F192579F0b4C408B66270E1f42463E5eA0E663",
        bondContractAddress: "0x1234567890abcdef1234567890abcdef12345678",
        balance: "87879872223",
      })

      const response = await request(app.getHttpServer())
        .get(`/api/v1/treasury/bonds/${treasury.bondContractAddress}/positions`)
        .send()
        .expect(HttpStatus.OK)

      expect(response.body).toEqual({
        balance: treasury.balance,
      })
    })
  })
})
