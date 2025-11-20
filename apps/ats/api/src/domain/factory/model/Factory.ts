// SPDX-License-Identifier: Apache-2.0

import { IsNotEmpty, IsString, IsBoolean, IsDate } from "class-validator"
import { FactoryAlreadyPausedError } from "../errors/FactoryAlreadyPausedError"
import { FactoryAlreadyUnpausedError } from "../errors/FactoryAlreadyUnpausedError"

export class Factory {
  @IsNotEmpty()
  @IsString()
  factoryId: string

  @IsBoolean()
  isPaused: boolean

  @IsDate()
  createdAt: Date

  @IsDate()
  updatedAt: Date

  pause(): void {
    if (this.isPaused) {
      throw FactoryAlreadyPausedError.factoryIdError(this.factoryId)
    }
    this.isPaused = true
  }

  unpause(): void {
    if (!this.isPaused) {
      throw FactoryAlreadyUnpausedError.factoryIdError(this.factoryId)
    }
    this.isPaused = false
  }
}
