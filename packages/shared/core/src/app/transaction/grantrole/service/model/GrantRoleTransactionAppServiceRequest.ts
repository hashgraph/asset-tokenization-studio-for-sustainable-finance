// SPDX-License-Identifier: Apache-2.0

import { IsNotEmpty, IsString } from "class-validator"
import { BaseTransactionAppServiceRequest } from "@transaction/model/BaseTransactionAppServiceRequest"

export class GrantRoleTransactionAppServiceRequest extends BaseTransactionAppServiceRequest {
  @IsNotEmpty()
  @IsString()
  readonly roleId: string

  @IsNotEmpty()
  @IsString()
  readonly userAccountId: string

  constructor(format: string, accountId: string, contractId: string, roleId: string, userAccountId: string) {
    super(format, accountId, contractId)
    this.roleId = roleId
    this.userAccountId = userAccountId
  }
}
