// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsNumber, IsString } from "class-validator"

export class DeleteClearingDomainServiceRequest {
  @IsNotEmpty()
  @IsString()
  bondContractId: string

  @IsNotEmpty()
  @IsString()
  holderAccountId: string

  @IsNotEmpty()
  @IsNumber()
  clearingId: number
}
