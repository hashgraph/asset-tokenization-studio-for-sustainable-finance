// SPDX-License-Identifier: Apache-2.0

import { Singleton } from "@hashgraph/green-bonds-shared-core"
import { HealthIndicatorResult, HealthIndicatorService } from "@nestjs/terminus"
import { AmqpConnection } from "@golevelup/nestjs-rabbitmq"

@Singleton()
export class RabbitMQHealthIndicator {
  constructor(
    private readonly amqpConnection: AmqpConnection,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  isHealthy(key: string): Promise<HealthIndicatorResult> {
    const indicator: any = this.healthIndicatorService.check(key)
    if (this.amqpConnection.connected) {
      return indicator.up()
    }
    return indicator.down()
  }
}
