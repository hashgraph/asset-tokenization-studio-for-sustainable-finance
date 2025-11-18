// SPDX-License-Identifier: Apache-2.0
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../src/AppModule";

describe("Health (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix("api/v1/oracle");
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("/health (GET)", () => {
    return request(app.getHttpServer())
      .get("/api/v1/oracle/health")
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty("status", "ok");
        expect(res.body).toHaveProperty("service", "oracle-api");
        expect(res.body).toHaveProperty("timestamp");
      });
  });
});
