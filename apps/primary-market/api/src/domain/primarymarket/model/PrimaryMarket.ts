// SPDX-License-Identifier: Apache-2.0

import { BaseEntity } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsString, IsBoolean } from "class-validator"

export class PrimaryMarket extends BaseEntity {
  @IsNotEmpty()
  @IsString()
  contractId: string

  @IsBoolean()
  isPaused: boolean
}
