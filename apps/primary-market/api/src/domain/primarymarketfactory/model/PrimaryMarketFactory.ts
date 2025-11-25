// SPDX-License-Identifier: Apache-2.0

import { BaseEntity } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsString, IsBoolean } from "class-validator"
import { PrimaryMarketFactoryAlreadyPausedError } from "../errors/PrimaryMarketFactoryAlreadyPausedError"
import { PrimaryMarketFactoryAlreadyUnpausedError } from "../errors/PrimaryMarketFactoryAlreadyUnpausedError"

export class PrimaryMarketFactory extends BaseEntity {
  @IsNotEmpty()
  @IsString()
  contractId: string

  @IsBoolean()
  isPaused: boolean

  pause(): void {
    if (this.isPaused) {
      throw PrimaryMarketFactoryAlreadyPausedError.factoryIdError(this.contractId)
    }
    this.isPaused = true
  }

  unpause(): void {
    if (!this.isPaused) {
      throw PrimaryMarketFactoryAlreadyUnpausedError.factoryIdError(this.contractId)
    }
    this.isPaused = false
  }
}
