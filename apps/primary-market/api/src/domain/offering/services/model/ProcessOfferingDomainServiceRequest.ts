// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsString, IsArray, IsNumber } from "class-validator"
import { OfferingProcessResult } from "@domain/shared/model/OfferingProcessResult"

export class ProcessOfferingDomainServiceRequest {
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
  processResults: OfferingProcessResult[]
}
