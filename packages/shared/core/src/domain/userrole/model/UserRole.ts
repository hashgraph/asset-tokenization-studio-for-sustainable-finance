// SPDX-License-Identifier: Apache-2.0

import { BaseEntity } from "@persistence/BaseEntity"
import { IsNotEmpty } from "class-validator"

export class UserRole extends BaseEntity {
  @IsNotEmpty()
  userAccountId: string

  @IsNotEmpty()
  roleId: string

  @IsNotEmpty()
  contractId: string
}
