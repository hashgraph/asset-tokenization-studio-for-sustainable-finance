// SPDX-License-Identifier: Apache-2.0

import { BaseEntity } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsString, IsBoolean } from "class-validator"
import { PrimaryMarketPausedError } from "../errors/PrimaryMarketPausedError"

export class PrimaryMarket extends BaseEntity {
  @IsNotEmpty()
  @IsString()
  contractId: string

  @IsBoolean()
  isPaused: boolean

  ensureActive(): void {
    if (this.isPaused) {
      throw PrimaryMarketPausedError.pausedError(this.contractId)
    }
  }
}
