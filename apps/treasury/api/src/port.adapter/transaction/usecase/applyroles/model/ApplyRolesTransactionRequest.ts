// SPDX-License-Identifier: Apache-2.0

import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { IsArray } from "class-validator"

export class ApplyRolesTransactionRequest extends BaseTransactionRequest {
  @IsArray()
  rolesToGrant: string[]

  @IsArray()
  rolesToRevoke: string[]

  constructor(format: string, accountId: string, rolesToGrant: string[] = [], rolesToRevoke: string[] = []) {
    super(format, accountId)
    this.rolesToGrant = rolesToGrant
    this.rolesToRevoke = rolesToRevoke
  }
}
