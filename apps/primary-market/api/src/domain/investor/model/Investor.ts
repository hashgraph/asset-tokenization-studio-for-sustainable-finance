// SPDX-License-Identifier: Apache-2.0

import { BaseEntity } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsString } from "class-validator"

export class Investor extends BaseEntity {
  @IsNotEmpty()
  @IsString()
  accountId: string
}
