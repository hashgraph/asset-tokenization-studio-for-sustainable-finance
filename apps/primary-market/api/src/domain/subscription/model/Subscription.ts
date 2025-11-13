// SPDX-License-Identifier: Apache-2.0

import { IsNotEmpty, IsEnum, IsNumberString, IsString, IsNumber, IsDate } from "class-validator"
import { SubscriptionStatus } from "@domain/shared/model/SubscriptionStatus"

export class Subscription {
  @IsNumber()
  @IsNotEmpty()
  id: number

  @IsNumber()
  @IsNotEmpty()
  offeringId: number

  @IsNotEmpty()
  @IsString()
  marketId: string

  @IsNotEmpty()
  @IsString()
  investorAccountId: string

  @IsNotEmpty()
  @IsNumberString()
  lotUnits: string

  @IsNotEmpty()
  @IsEnum(SubscriptionStatus)
  status: SubscriptionStatus

  @IsDate()
  createdAt: Date

  @IsDate()
  updatedAt: Date
}
