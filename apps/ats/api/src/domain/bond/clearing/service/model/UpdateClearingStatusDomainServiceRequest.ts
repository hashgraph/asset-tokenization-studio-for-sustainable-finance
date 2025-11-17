// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsString, IsNumber, IsEnum, IsOptional } from "class-validator"
import { ClearingStatus } from "../../model/ClearingHold"

export class UpdateClearingStatusDomainServiceRequest {
  @IsNotEmpty()
  @IsString()
  bondContractId: string

  @IsNotEmpty()
  @IsString()
  holderAccountId: string

  @IsNotEmpty()
  @IsNumber()
  clearingId: number

  @IsNotEmpty()
  @IsEnum(ClearingStatus)
  newStatus: ClearingStatus
}
