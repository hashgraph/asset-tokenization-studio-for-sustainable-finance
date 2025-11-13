// SPDX-License-Identifier: Apache-2.0

import { IsArray, IsNotEmpty, IsString } from "class-validator"
import { BaseTransactionAppServiceRequest } from "@transaction/model/BaseTransactionAppServiceRequest"

export class ApplyRolesTransactionAppServiceRequest extends BaseTransactionAppServiceRequest {
  @IsArray()
  readonly rolesToGrant: string[]

  @IsArray()
  readonly rolesToRevoke: string[]

  @IsNotEmpty()
  @IsString()
  readonly userAccountId: string

  constructor(
    format: string,
    accountId: string,
    contractId: string,
    rolesToGrant: string[],
    rolesToRevoke: string[],
    userAccountId: string,
  ) {
    super(format, accountId, contractId)
    this.rolesToGrant = rolesToGrant || []
    this.rolesToRevoke = rolesToRevoke || []
    this.userAccountId = userAccountId
  }
}
