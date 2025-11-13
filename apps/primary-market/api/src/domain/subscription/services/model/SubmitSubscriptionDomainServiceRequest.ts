// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsString, IsNumberString, IsNumber } from "class-validator"

export class SubmitSubscriptionDomainServiceRequest {
  @IsNumber()
  @IsNotEmpty()
  offeringId: number

  @IsNotEmpty()
  @IsString()
  marketContractId: string

  @IsNumber()
  @IsNotEmpty()
  subscriptionId: number

  @IsNotEmpty()
  @IsString()
  investorAccountId: string

  @IsNotEmpty()
  @IsNumberString()
  lotUnits: string
}
