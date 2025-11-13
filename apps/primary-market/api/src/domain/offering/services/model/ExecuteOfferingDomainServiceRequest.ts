// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsString, IsArray, IsNumber } from "class-validator"

export class ExecuteOfferingDomainServiceRequest {
  @IsNumber()
  @IsNotEmpty()
  offeringId: number

  @IsNotEmpty()
  @IsString()
  marketContractId: string

  @IsNotEmpty()
  @IsString()
  operatorAccountId: string

  @IsArray()
  @IsNumber({}, { each: true })
  subscriptionIdsSuccess: number[]

  @IsArray()
  @IsNumber({}, { each: true })
  subscriptionIdsFailed: number[]
}
