// SPDX-License-Identifier: Apache-2.0

import { IsArray, IsNotEmpty, IsString, ArrayNotEmpty } from "class-validator"
import { BaseTransactionAppServiceRequest } from "@transaction/model/BaseTransactionAppServiceRequest"

export class ApplyRolesTransactionAppServiceRequest extends BaseTransactionAppServiceRequest {
  @IsArray()
  @ArrayNotEmpty()
  readonly roles: string[]

  @IsArray()
  @ArrayNotEmpty()
  readonly actives: boolean[]

  @IsNotEmpty()
  @IsString()
  readonly userAccountId: string

  constructor(
    format: string,
    accountId: string,
    contractId: string,
    roles: string[],
    actives: boolean[],
    userAccountId: string,
  ) {
    super(format, accountId, contractId)
    this.roles = roles
    this.actives = actives
    this.userAccountId = userAccountId
  }
}
