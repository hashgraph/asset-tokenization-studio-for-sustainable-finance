// SPDX-License-Identifier: Apache-2.0
import { Test, TestingModule } from "@nestjs/testing"
import { AppController } from "../src/AppController"
import { AppService } from "../src/AppService"

describe("AppController", () => {
  let appController: AppController

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile()

    appController = app.get<AppController>(AppController)
  })

  describe("health", () => {
    it("should return status ok and actual version", () => {
      expect(appController.getHealth()).toEqual({
        status: "ok",
        version: process.env.npm_package_version ?? "unknown",
      })
    })
  })
})
