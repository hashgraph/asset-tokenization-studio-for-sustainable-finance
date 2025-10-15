// SPDX-License-Identifier: Apache-2.0

import { BaseEntity } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsNumberString } from "class-validator"

export class EnvironmentalAssetToken extends BaseEntity {
  @IsNotEmpty()
  environmentalAssetId: string

  @IsNotEmpty()
  @IsNumberString({ no_symbols: true })
  serialNumber: string
}
