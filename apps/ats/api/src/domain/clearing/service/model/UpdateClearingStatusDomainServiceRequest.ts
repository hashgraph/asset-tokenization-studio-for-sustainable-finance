// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsString, IsNumber, IsEnum } from "class-validator"
import { ClearingStatus } from "@domain/clearing/model/ClearingStatus"

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
