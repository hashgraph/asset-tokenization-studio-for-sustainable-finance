// SPDX-License-Identifier: Apache-2.0

import { IsNumber, IsString } from "class-validator"

export class PaymentResultItemModel {
  @IsString()
  holder: string

  @IsNumber()
  status: number

  @IsString()
  amount: string
}
