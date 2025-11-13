// SPDX-License-Identifier: Apache-2.0
import { BaseEntity } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsString, IsNumberString } from "class-validator"

export class BondHolderBalance extends BaseEntity {
  @IsNotEmpty()
  @IsString()
  contractId: string

  @IsNotEmpty()
  @IsString()
  holderAccountId: string

  @IsNotEmpty()
  @IsString()
  partition: string

  @IsNotEmpty()
  @IsNumberString()
  availableBalance: string

  @IsNotEmpty()
  @IsNumberString()
  lockedBalance: string
}
