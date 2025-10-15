// SPDX-License-Identifier: Apache-2.0

import { BaseEntity } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsNumber, Min } from "class-validator"

export class EnvironmentalAssetToken extends BaseEntity {
  @IsNotEmpty()
  environmentalAssetId: string

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  tokenId: number
}
