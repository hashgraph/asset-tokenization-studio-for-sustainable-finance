// SPDX-License-Identifier: Apache-2.0

import { PrimaryMarket } from "@domain/primarymarket/model/PrimaryMarket"
import { BaseEntity } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsString, IsNumber, IsDate, ValidateNested } from "class-validator"
import { Type } from "class-transformer"
import { OfferingUnauthorizedOperatorError } from "../errors/OfferingUnauthorizedOperatorError"

export class Offering extends BaseEntity {
  @IsNotEmpty()
  @IsString()
  offeringDltId: string

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => PrimaryMarket)
  market: PrimaryMarket

  @IsNotEmpty()
  @IsString()
  bondContractId: string

  @IsNotEmpty()
  @IsString()
  operatorId: string

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
  minQuantity: string

  @IsNotEmpty()
  @IsString()
  maxQuantity: string

  @IsNotEmpty()
  @IsString()
  targetQuantity: string

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

  checkOperator(operatorId: string): void {
    if (this.operatorId !== operatorId) {
      throw OfferingUnauthorizedOperatorError.operatorMismatchError(this.offeringDltId, this.operatorId, operatorId)
    }
  }
}
