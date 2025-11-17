// SPDX-License-Identifier: Apache-2.0

import { HealthPort } from "@port/health/HealthPort"
import { Controller, Get } from "@nestjs/common"
import { HealthCheck, HealthCheckService } from "@nestjs/terminus"
import { RabbitMQHealthIndicator } from "@port/health/indicator/RabbitMQHealthIndicator"

@Controller("health")
export class HealthHttpAdapter implements HealthPort {
  constructor(
    private readonly health: HealthCheckService,
    private readonly rabbitMQHealthIndicator: RabbitMQHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check(): Promise<any> {
    return this.health.check([() => this.rabbitMQHealthIndicator.isHealthy("rabbitmq")])
  }
}
