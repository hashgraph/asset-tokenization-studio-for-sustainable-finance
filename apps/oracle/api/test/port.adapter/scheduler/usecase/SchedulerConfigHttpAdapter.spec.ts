// SPDX-License-Identifier: Apache-2.0

import { Test, TestingModule } from "@nestjs/testing"
import { HttpStatus, INestApplication } from "@nestjs/common"
import request from "supertest"
import { ScheduleModule } from "@nestjs/schedule"
import { CONTROLLERS, PROVIDERS } from "../../../../src/Components"
import { SharedModule } from "@hashgraph/green-bonds-shared-core"
import { PostgreSqlContainer } from "../../../shared/containers/PostgresqlContainer"
import { PostgresModule } from "@config/PostgresModule"
import { Repository } from "typeorm"
import { getRepositoryToken } from "@nestjs/typeorm"
import { SchedulerConfigPersistence } from "@port/scheduler/persistence/model/SchedulerConfigPersistence"

describe("SchedulerConfigHttpAdapter API Integration", () => {
  let app: INestApplication
  let container: PostgreSqlContainer
  let schedulerConfigRepository: Repository<SchedulerConfigPersistence>

  beforeAll(async () => {
    container = await PostgreSqlContainer.create()
  })

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SharedModule, ScheduleModule.forRoot(), PostgresModule.forRoot(container.getConfig())],
      controllers: CONTROLLERS,
      providers: [...PROVIDERS],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.setGlobalPrefix("api/v1")
    app.useLogger(false)
    await app.init()
    schedulerConfigRepository = app.get(getRepositoryToken(SchedulerConfigPersistence))
  })

  afterAll(async () => {
    await container.stop()
  })

  afterEach(async () => {
    if (app) {
      // Clean up database before closing app
      if (schedulerConfigRepository) {
        const configs = await schedulerConfigRepository.find()
        if (configs.length > 0) {
          await schedulerConfigRepository.remove(configs)
        }
      }
      await app.close()
    }
  })

  describe("GET /config", () => {
    it("should return scheduler config", async () => {
      const config = await schedulerConfigRepository.save({
        cronExpression: "0 */5 * * * *",
        concurrencyLimit: 10,
        enabled: true,
      })

      const response = await request(app.getHttpServer()).get("/api/v1/scheduler/config").expect(HttpStatus.OK)

      expect(response.body).toMatchObject({
        id: config.id,
        cronExpression: "0 */5 * * * *",
        concurrencyLimit: 10,
        enabled: true,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      })
    })

    it("should return scheduler config when disabled", async () => {
      await schedulerConfigRepository.save({
        cronExpression: "0 */10 * * * *",
        concurrencyLimit: 5,
        enabled: false,
      })

      const response = await request(app.getHttpServer()).get("/api/v1/scheduler/config").expect(HttpStatus.OK)

      expect(response.body.enabled).toBe(false)
    })
  })

  describe("PATCH /config", () => {
    it("should update scheduler cronExpression", async () => {
      await schedulerConfigRepository.save({
        cronExpression: "0 */5 * * * *",
        concurrencyLimit: 10,
        enabled: true,
      })

      const updateRequest = {
        cronExpression: "0 */15 * * * *",
      }

      const response = await request(app.getHttpServer())
        .patch("/api/v1/scheduler/config")
        .send(updateRequest)
        .expect(HttpStatus.OK)

      expect(response.body.cronExpression).toBe("0 */15 * * * *")
      expect(response.body.concurrencyLimit).toBe(10)
      expect(response.body.enabled).toBe(true)
    })

    it("should update scheduler concurrencyLimit", async () => {
      await schedulerConfigRepository.save({
        cronExpression: "0 */5 * * * *",
        concurrencyLimit: 10,
        enabled: true,
      })

      const updateRequest = {
        concurrencyLimit: 20,
      }

      const response = await request(app.getHttpServer())
        .patch("/api/v1/scheduler/config")
        .send(updateRequest)
        .expect(HttpStatus.OK)

      expect(response.body.concurrencyLimit).toBe(20)
      expect(response.body.cronExpression).toBe("0 */5 * * * *")
    })

    it("should update scheduler enabled status", async () => {
      await schedulerConfigRepository.save({
        cronExpression: "0 */5 * * * *",
        concurrencyLimit: 10,
        enabled: true,
      })

      const updateRequest = {
        enabled: false,
      }

      const response = await request(app.getHttpServer())
        .patch("/api/v1/scheduler/config")
        .send(updateRequest)
        .expect(HttpStatus.OK)

      expect(response.body.enabled).toBe(false)
    })

    it("should update multiple fields at once", async () => {
      await schedulerConfigRepository.save({
        cronExpression: "0 */5 * * * *",
        concurrencyLimit: 10,
        enabled: true,
      })

      const updateRequest = {
        cronExpression: "0 0 * * * *",
        concurrencyLimit: 15,
        enabled: false,
      }

      const response = await request(app.getHttpServer())
        .patch("/api/v1/scheduler/config")
        .send(updateRequest)
        .expect(HttpStatus.OK)

      expect(response.body.cronExpression).toBe("0 0 * * * *")
      expect(response.body.concurrencyLimit).toBe(15)
      expect(response.body.enabled).toBe(false)
    })

    it("should return 400 when concurrencyLimit is less than 1", async () => {
      await schedulerConfigRepository.save({
        cronExpression: "0 */5 * * * *",
        concurrencyLimit: 10,
        enabled: true,
      })

      const updateRequest = {
        concurrencyLimit: 0,
      }

      await request(app.getHttpServer())
        .patch("/api/v1/scheduler/config")
        .send(updateRequest)
        .expect(HttpStatus.BAD_REQUEST)
    })

    it("should return 400 when cronExpression is invalid", async () => {
      await schedulerConfigRepository.save({
        cronExpression: "0 */5 * * * *",
        concurrencyLimit: 10,
        enabled: true,
      })

      const updateRequest = {
        cronExpression: "invalid cron",
      }

      await request(app.getHttpServer())
        .patch("/api/v1/scheduler/config")
        .send(updateRequest)
        .expect(HttpStatus.BAD_REQUEST)
    })

    it("should update config when no changes are provided", async () => {
      const config = await schedulerConfigRepository.save({
        cronExpression: "0 */5 * * * *",
        concurrencyLimit: 10,
        enabled: true,
      })

      const updateRequest = {}

      const response = await request(app.getHttpServer())
        .patch("/api/v1/scheduler/config")
        .send(updateRequest)
        .expect(HttpStatus.OK)

      expect(response.body.id).toBe(config.id)
      expect(response.body.cronExpression).toBe("0 */5 * * * *")
      expect(response.body.concurrencyLimit).toBe(10)
      expect(response.body.enabled).toBe(true)
    })
  })
})
