// SPDX-License-Identifier: Apache-2.0
import { BaseEntity } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsOptional, IsString } from "class-validator"

export class BondProceedRecipient extends BaseEntity {
  @IsNotEmpty()
  @IsString()
  contractId: string

  @IsNotEmpty()
  @IsString()
  proceedRecipientAddress: string

  @IsString()
  @IsOptional()
  data?: string
}
