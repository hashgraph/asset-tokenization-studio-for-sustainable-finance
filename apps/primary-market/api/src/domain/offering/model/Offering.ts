// SPDX-License-Identifier: Apache-2.0

import { IsNotEmpty, IsString, IsNumber, IsDate } from "class-validator"
import { OfferingUnauthorizedOperatorError } from "../errors/OfferingUnauthorizedOperatorError"

export class Offering {
  @IsNumber()
  @IsNotEmpty()
  id: number

  @IsNotEmpty()
  @IsString()
  marketId: string

  @IsNotEmpty()
  @IsString()
  bondContractId: string

  @IsNotEmpty()
  @IsString()
  operatorAccountId: string

  @IsNotEmpty()
  @IsString()
  treasuryContractId: string

  @IsNotEmpty()
  @IsString()
  paymentTokenContractId: string

  @IsNotEmpty()
  @IsString()
  lotSize: string

  @IsNotEmpty()
  @IsString()
  minLots: string

  @IsNotEmpty()
  @IsString()
  maxLots: string

  @IsNotEmpty()
  @IsString()
  targetLots: string

  @IsNotEmpty()
  @IsNumber()
  targetQuantityRule: number

  @IsNotEmpty()
  @IsDate()
  startDate: Date

  @IsNotEmpty()
  @IsDate()
  endDate: Date

  @IsNotEmpty()
  @IsNumber()
  deadlineRule: number

  @IsNotEmpty()
  @IsString()
  price: string

  @IsNotEmpty()
  @IsNumber()
  priceDecimals: number

  @IsDate()
  createdAt: Date

  @IsDate()
  updatedAt: Date

  ensureOperatorMatches(operatorAccountId: string): void {
    if (this.operatorAccountId !== operatorAccountId) {
      throw OfferingUnauthorizedOperatorError.operatorMismatchError(this.id, this.operatorAccountId, operatorAccountId)
    }
  }
}
