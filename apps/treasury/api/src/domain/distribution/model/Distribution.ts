// SPDX-License-Identifier: Apache-2.0

import { IsDate, IsNotEmpty, IsNumber } from "class-validator"

export class Distribution {
  @IsNumber()
  @IsNotEmpty()
  id: number

  @IsNotEmpty()
  treasuryId: string

  @IsDate()
  createdAt: Date

  @IsDate()
  updatedAt: Date
}
