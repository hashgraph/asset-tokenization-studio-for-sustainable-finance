// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsString, IsNumber } from "class-validator"

export class CancelSubscriptionDomainServiceRequest {
  @IsNumber()
  @IsNotEmpty()
  offeringId: number

  @IsNotEmpty()
  @IsString()
  marketContractId: string

  @IsNumber()
  @IsNotEmpty()
  subscriptionId: number
}
