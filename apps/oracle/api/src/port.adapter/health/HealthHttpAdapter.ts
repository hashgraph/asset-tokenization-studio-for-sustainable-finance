// SPDX-License-Identifier: Apache-2.0
import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";

@ApiTags("Health")
@Controller("health")
export class HealthHttpAdapter {
  @Get()
  @ApiOperation({ summary: "Health check endpoint" })
  @ApiResponse({ status: 200, description: "Service is healthy" })
  check() {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "oracle-api",
    };
  }
}
