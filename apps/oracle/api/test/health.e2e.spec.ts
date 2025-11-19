// SPDX-License-Identifier: Apache-2.0
import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import request from "supertest"
import { ScheduleModule } from "@nestjs/schedule"
import { CONTROLLERS, PROVIDERS } from "../src/Components"
import { SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "./shared/containers/PostgresqlContainer"
import { PostgresModule } from "../src/config/PostgresModule"

describe("Health (e2e)", () => {
  let app: INestApplication
  let container: PostgreSqlContainer

  beforeAll(async () => {
    container = await PostgreSqlContainer.create()

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SharedModule, ScheduleModule.forRoot(), PostgresModule.forRoot(container.getConfig())],
      controllers: CONTROLLERS,
      providers: [...PROVIDERS],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.setGlobalPrefix("api/v1")
    app.useLogger(false)
    await app.init()
  })

  afterAll(async () => {
    if (app) {
      await app.close()
    }
    await container.stop()
  })

  it("/health (GET)", () => {
    return request(app.getHttpServer())
      .get("/api/v1/health")
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty("status", "ok")
        expect(res.body).toHaveProperty("service", "oracle-api")
        expect(res.body).toHaveProperty("timestamp")
      })
  })
})
