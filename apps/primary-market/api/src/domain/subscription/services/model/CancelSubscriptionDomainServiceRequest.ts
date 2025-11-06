// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsString, IsNumberString } from "class-validator"

export class CancelSubscriptionDomainServiceRequest {
  @IsNotEmpty()
  @IsNumberString()
  offeringDltId: string

  @IsNotEmpty()
  @IsString()
  marketContractId: string

  @IsNotEmpty()
  @IsNumberString()
  subscriptionDltId: string
}
