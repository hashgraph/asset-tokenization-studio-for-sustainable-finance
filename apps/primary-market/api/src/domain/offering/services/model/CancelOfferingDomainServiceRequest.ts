// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsString, IsNumberString, IsArray } from "class-validator"

export class CancelOfferingDomainServiceRequest {
  @IsNotEmpty()
  @IsNumberString()
  offeringDltId: string

  @IsNotEmpty()
  @IsString()
  marketContractId: string

  @IsNotEmpty()
  @IsString()
  operatorId: string

  @IsArray()
  @IsNumberString({}, { each: true })
  subscriptionDltIdsSuccess: string[]

  @IsArray()
  @IsNumberString({}, { each: true })
  subscriptionDltIdsFailed: string[]
}
