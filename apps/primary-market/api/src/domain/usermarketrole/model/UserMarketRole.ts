// SPDX-License-Identifier: Apache-2.0

import { BaseEntity } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, ValidateNested } from "class-validator"
import { User } from "../../user/model/User"
import { Role } from "@domain/role/model/Role"
import { PrimaryMarket } from "@domain/primarymarket/model/PrimaryMarket"
import { Type } from "class-transformer"

export class UserMarketRole extends BaseEntity {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => User)
  user: User

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => Role)
  role: Role

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => PrimaryMarket)
  market: PrimaryMarket
}
