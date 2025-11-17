// SPDX-License-Identifier: Apache-2.0

import { Controller, Get } from "@nestjs/common"
import { HealthCheckService, HealthCheck, HttpHealthIndicator } from "@nestjs/terminus"
import { HealthPort } from "./HealthPort"

@Controller("api/v1/health")
export class HealthHttpAdapter implements HealthPort {
  constructor(
    private readonly health: HealthCheckService,
    private readonly http: HttpHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check(): Promise<any> {
    const routes = Array.from(new Set(process.env.ROUTES.split(",")))
    return this.health.check(routes.map((route) => () => this.http.pingCheck(route, `${route}/api/v1/health`)))
  }
}
