// SPDX-License-Identifier: Apache-2.0

import { ConfigService } from "@port/config/ConfigService"
import { ConfigService as InternalNestJSConfigService } from "@nestjs/config"
import { BaseConfigService, Singleton } from "@hashgraph/green-bonds-shared-core"
import { ConfigKeys } from "@port/config/ConfigKeys"

@Singleton()
export class NestJSConfigService extends BaseConfigService implements ConfigService {
  private static SEPARATOR: string = ";"

  constructor(configService: InternalNestJSConfigService) {
    super(configService)
  }

  getBlockNumber(): number {
    return +this.getProperty(ConfigKeys.BLOCK_NUMBER)
  }

  getContracts(): string[] {
    return (<string>this.getProperty(ConfigKeys.CONTRACTS)).split(NestJSConfigService.SEPARATOR)
  }

  getEvents(): string[] {
    return (<string>this.getProperty(ConfigKeys.EVENTS)).split(NestJSConfigService.SEPARATOR)
  }

  getPollInternal(): number {
    return +this.getProperty(ConfigKeys.POLL_INTERVAL)
  }
}
