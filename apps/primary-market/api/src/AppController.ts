// SPDX-License-Identifier: Apache-2.0

import { Controller, Get } from "@nestjs/common"
import { AppService } from "./AppService"
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger"

@ApiTags("health")
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("health")
  @ApiOperation({ summary: "Health check", description: "Check if the API is running correctly" })
  @ApiResponse({
    status: 200,
    description: "API is healthy",
    schema: { example: { status: "ok", version: "1.0.0" } },
  })
  getHealth(): { status: string; version: string } {
    return this.appService.getHealthCheck()
  }
}
