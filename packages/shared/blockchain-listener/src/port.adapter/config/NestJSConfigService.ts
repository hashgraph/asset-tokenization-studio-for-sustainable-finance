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
    const blockNumber = this.getProperty(ConfigKeys.BLOCK_NUMBER)
    return blockNumber ? +blockNumber : null
  }

  getContracts(): string[] {
    const contracts = <string>this.getProperty(ConfigKeys.CONTRACTS)
    return contracts ? contracts.split(NestJSConfigService.SEPARATOR) : []
  }

  getEvents(): string[] {
    const events = <string>this.getProperty(ConfigKeys.EVENTS)
    return events ? events.split(NestJSConfigService.SEPARATOR) : []
  }

  getPollInternal(): number {
    const pollInternal = this.getProperty(ConfigKeys.POLL_INTERVAL)
    return pollInternal ? +pollInternal : null
  }
}
