// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsString, IsNumberString, IsArray } from "class-validator"

export class CancelOfferingDomainServiceRequest {
  @IsNotEmpty()
  @IsNumberString()
  offeringId: string

  @IsNotEmpty()
  @IsString()
  marketId: string

  @IsNotEmpty()
  @IsString()
  operatorId: string

  @IsArray()
  @IsNumberString({}, { each: true })
  subscriptionIdsSuccess: string[]

  @IsArray()
  @IsNumberString({}, { each: true })
  subscriptionIdsFailed: string[]
}
