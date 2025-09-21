// SPDX-License-Identifier: Apache-2.0

import { ConfigService } from "@nestjs/config"

export abstract class BaseConfigService {
  protected constructor(private readonly configService: ConfigService) {}

  protected getProperty(key: string): string | number | boolean {
    return this.configService.get(key)
  }
}
