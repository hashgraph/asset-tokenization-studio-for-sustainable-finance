// SPDX-License-Identifier: Apache-2.0

import { Offering } from "@domain/offering/model/Offering"
import { Investor } from "@domain/investor/model/Investor"
import { BaseEntity } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, ValidateNested, IsEnum, IsNumberString } from "class-validator"
import { Type } from "class-transformer"
import { SubscriptionStatus } from "@domain/shared/model/SubscriptionStatus"

export class Subscription extends BaseEntity {
  @IsNotEmpty()
  @IsNumberString()
  subscriptionDltId: string

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => Offering)
  offering: Offering

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => Investor)
  investor: Investor

  @IsNotEmpty()
  @IsNumberString()
  lotUnits: string

  @IsNotEmpty()
  @IsEnum(SubscriptionStatus)
  status: SubscriptionStatus
}
