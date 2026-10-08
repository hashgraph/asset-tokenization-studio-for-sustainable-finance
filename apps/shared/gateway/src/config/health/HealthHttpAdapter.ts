// SPDX-License-Identifier: Apache-2.0

import { Controller, Get } from "@nestjs/common"
import { HealthCheckService, HealthCheck, HealthIndicatorService } from "@nestjs/terminus"
import axios from "axios"
import { readVersion } from "@hashgraph/green-bonds-shared-core"
import { HealthPort } from "./HealthPort"

@Controller("api/v1/health")
export class HealthHttpAdapter implements HealthPort {
  constructor(
    private readonly health: HealthCheckService,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  @Get()
  @HealthCheck()
  check(): Promise<any> {
    const routes = Array.from(new Set(process.env.ROUTES.split(",")))
    return this.health.check([
      () => this.healthIndicatorService.check("app").up({ version: readVersion(__dirname) }),
      ...routes.map((route) => async () => {
        const indicator = this.healthIndicatorService.check(route)
        try {
          const { data } = await axios.get(`${route}/api/v1/health`, { timeout: 5000 })
          const version = data?.info?.app?.version ?? "unknown"
          return indicator.up({ version })
        } catch {
          return indicator.down({})
        }
      }),
    ])
  }
}
