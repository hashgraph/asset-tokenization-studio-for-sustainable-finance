// SPDX-License-Identifier: Apache-2.0

import { BaseEntity } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsNumber } from "class-validator"

export class EnvironmentalAssetToken extends BaseEntity {
  @IsNotEmpty()
  environmentalAssetId: string

  @IsNotEmpty()
  @IsNumber()
  tokenId: number
}
