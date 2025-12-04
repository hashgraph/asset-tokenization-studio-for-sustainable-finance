// SPDX-License-Identifier: Apache-2.0

import { HealthPort } from "@port/health/HealthPort"
import { Controller, Get } from "@nestjs/common"
import { HealthCheckService, TypeOrmHealthIndicator, HealthCheck } from "@nestjs/terminus"
import { BlockchainListenerHealthIndicator } from "@hashgraph/green-bonds-blockchain-listener"
import { ApiExcludeController } from "@nestjs/swagger"

@ApiExcludeController()
@Controller("health")
export class HealthHttpAdapter implements HealthPort {
  constructor(
    private readonly health: HealthCheckService,
    private readonly typeOrmHealthIndicator: TypeOrmHealthIndicator,
    private readonly blockchainListenerHealthIndicator: BlockchainListenerHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check(): Promise<any> {
    return this.health.check([
      () => this.typeOrmHealthIndicator.pingCheck("database"),
      () => this.blockchainListenerHealthIndicator.isHealthy("blockchain-listener"),
    ])
  }
}
