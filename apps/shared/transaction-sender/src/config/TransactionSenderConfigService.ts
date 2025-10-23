// SPDX-License-Identifier: Apache-2.0

import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { BaseConfigService } from "@hashgraph/green-bonds-shared-core"
import { ConfigKeys } from "./ConfigKeys"

@Injectable()
export class TransactionSenderConfigService extends BaseConfigService {
  constructor(configService: ConfigService) {
    super(configService)
  }

  getNetwork(): string {
    return (this.getProperty(ConfigKeys.NETWORK) as string) || "testnet"
  }


  getLogLevel(): string {
    return (this.getProperty(ConfigKeys.LOG_LEVEL) as string) || "log"
  }
}