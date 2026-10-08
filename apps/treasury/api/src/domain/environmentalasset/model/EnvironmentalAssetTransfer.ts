// SPDX-License-Identifier: Apache-2.0

import { BaseEntity } from "@hashgraph/green-bonds-shared-core"
import { IsDefined, IsEnum, IsNotEmpty, IsNumber } from "class-validator"
import { TransferType } from "@domain/shared/model/TransferType"

export class EnvironmentalAssetTransfer extends BaseEntity {
  @IsNotEmpty()
  accountId: string

  @IsNotEmpty()
  environmentalAssetId: string

  @IsDefined()
  @IsNumber()
  tokenId: number

  @IsDefined()
  @IsEnum(TransferType)
  type: TransferType
}
