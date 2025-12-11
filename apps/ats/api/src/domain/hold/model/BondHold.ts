// SPDX-License-Identifier: Apache-2.0

import { IsNotEmpty, IsString, IsNumber, IsDate, IsNumberString } from "class-validator"

export class BondHold {
  @IsNumber()
  @IsNotEmpty()
  id: number

  @IsNotEmpty()
  @IsString()
  bondContractId: string

  @IsNotEmpty()
  @IsString()
  holderAccountId: string

  @IsNotEmpty()
  @IsString()
  partition: string

  @IsNotEmpty()
  @IsNumberString()
  amount: string

  @IsNotEmpty()
  @IsDate()
  expirationTimestamp: Date

  @IsNotEmpty()
  @IsString()
  escrowAccountId: string

  @IsNotEmpty()
  @IsString()
  toAccountId: string

  @IsString()
  data: string

  @IsString()
  operatorData: string

  @IsString()
  operatorAccountId: string

  @IsDate()
  createdAt: Date

  @IsDate()
  updatedAt: Date
}
