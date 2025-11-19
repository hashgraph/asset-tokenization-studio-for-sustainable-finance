// SPDX-License-Identifier: Apache-2.0

import { IsNotEmpty, IsString, IsBoolean, IsDate } from "class-validator"

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
}
