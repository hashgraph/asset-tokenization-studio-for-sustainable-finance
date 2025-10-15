// SPDX-License-Identifier: Apache-2.0

import { BaseEntity } from "@hashgraph/green-bonds-shared-core"
import { IsEnum, IsNotEmpty, IsNumberString } from "class-validator"
import { TransferType } from "./TransferType"

export class EnvironmentalAssetTokenTransfer extends BaseEntity {
  @IsNotEmpty()
  environmentalAssetTokenId: string

  @IsNotEmpty()
  accountId: string

  @IsNotEmpty()
  @IsNumberString({ no_symbols: true })
  amount: string

  @IsEnum(TransferType)
  type: TransferType
}
