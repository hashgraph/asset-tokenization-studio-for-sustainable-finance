// SPDX-License-Identifier: Apache-2.0

import { BaseEntity } from "@hashgraph/green-bonds-shared-core"
import { IsEnum, IsNotEmpty } from "class-validator"
import { TransferType } from "./TransferType"

export class EnvironmentalAssetTokenTransfer extends BaseEntity {
  @IsNotEmpty()
  environmentalAssetTokenId: string

  @IsNotEmpty()
  accountId: string

  @IsEnum(TransferType)
  type: TransferType
}
