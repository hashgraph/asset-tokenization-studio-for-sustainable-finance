// SPDX-License-Identifier: Apache-2.0

import { HealthPort } from "@port/health/HealthPort"
import { Controller, Get } from "@nestjs/common"
import { HealthCheckService, TypeOrmHealthIndicator, HealthCheck, HealthIndicatorService } from "@nestjs/terminus"
import { BlockchainListenerHealthIndicator } from "@hashgraph/green-bonds-blockchain-listener"
import { ApiExcludeController } from "@nestjs/swagger"
import { readVersion } from "@hashgraph/green-bonds-shared-core"

@ApiExcludeController()
@Controller("api/v1/health")
export class HealthHttpAdapter implements HealthPort {
  constructor(
    private readonly health: HealthCheckService,
    private readonly typeOrmHealthIndicator: TypeOrmHealthIndicator,
    private readonly blockchainListenerHealthIndicator: BlockchainListenerHealthIndicator,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  @Get()
  @HealthCheck()
  check(): Promise<any> {
    return this.health.check([
      () => this.healthIndicatorService.check("app").up({ version: readVersion(__dirname) }),
      () => this.typeOrmHealthIndicator.pingCheck("database"),
      () => this.blockchainListenerHealthIndicator.isHealthy("blockchain-listener"),
    ])
  }
}
