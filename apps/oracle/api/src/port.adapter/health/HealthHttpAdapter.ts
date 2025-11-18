// SPDX-License-Identifier: Apache-2.0
import { Controller, Get } from "@nestjs/common"

@Controller("health")
export class HealthHttpAdapter {
  @Get()
  check() {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "oracle-api",
    }
  }
}
