// SPDX-License-Identifier: Apache-2.0

import { IsDate, IsNotEmpty, IsNumber } from "class-validator"

export class Distribution {
  @IsNumber()
  @IsNotEmpty()
  id: number

  @IsDate()
  createdAt: Date

  @IsDate()
  updatedAt: Date
}
