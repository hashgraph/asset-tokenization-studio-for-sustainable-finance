// SPDX-License-Identifier: Apache-2.0

import { BaseEntity } from "@hashgraph/green-bonds-shared-core"
import { IsDefined, IsEnum, IsNotEmpty, IsNumber, Min } from "class-validator"
import { TransferType } from "@domain/shared/model/TransferType"

export class EnvironmentalAssetTransfer extends BaseEntity {
  @IsNotEmpty()
  accountId: string

  @IsNotEmpty()
  environmentalAssetId: string

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  tokenId: number

  @IsDefined()
  @IsEnum(TransferType)
  type: TransferType
}
