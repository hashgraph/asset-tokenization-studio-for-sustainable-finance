// SPDX-License-Identifier: Apache-2.0

import { IsNotEmpty, IsString } from "class-validator"
import { BaseTransactionAppServiceRequest } from "@transaction/model/BaseTransactionAppServiceRequest"

export class RenounceRoleTransactionAppServiceRequest extends BaseTransactionAppServiceRequest {
  @IsNotEmpty()
  @IsString()
  readonly roleId: string

  constructor(format: string, accountId: string, contractId: string, roleId: string) {
    super(format, accountId, contractId)
    this.roleId = roleId
  }
}
