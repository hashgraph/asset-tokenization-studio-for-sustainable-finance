// SPDX-License-Identifier: Apache-2.0

import { HealthPort } from "@port/health/HealthPort"
import { Controller, Get } from "@nestjs/common"
import { HealthCheck, HealthCheckService, HealthIndicatorService } from "@nestjs/terminus"
import { RabbitMQHealthIndicator } from "@port/health/indicator/RabbitMQHealthIndicator"
import { readVersion } from "@hashgraph/green-bonds-shared-core"

@Controller("health")
export class HealthHttpAdapter implements HealthPort {
  constructor(
    private readonly health: HealthCheckService,
    private readonly rabbitMQHealthIndicator: RabbitMQHealthIndicator,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  @Get()
  @HealthCheck()
  check(): Promise<any> {
    return this.health.check([
      () => this.healthIndicatorService.check("app").up({ version: readVersion(__dirname) }),
      () => this.rabbitMQHealthIndicator.isHealthy("rabbitmq"),
    ])
  }
}
