// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsNumber, IsString } from "class-validator"

export class DeleteBondLockDomainServiceRequest {
  @IsNumber()
  lockId: number

  @IsString()
  @IsNotEmpty()
  bondContractId: string

  @IsString()
  @IsNotEmpty()
  holderAccountId: string

  @IsString()
  @IsNotEmpty()
  partition: string

  @IsString()
  @IsNotEmpty()
  operatorAccountId: string
}
