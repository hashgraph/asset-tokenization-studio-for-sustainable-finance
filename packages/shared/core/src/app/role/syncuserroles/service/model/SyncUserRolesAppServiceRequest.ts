// SPDX-License-Identifier: Apache-2.0

import { IsNotEmpty, IsString } from "class-validator"

export class SyncUserRolesAppServiceRequest {
  @IsNotEmpty()
  @IsString()
  readonly contractId: string

  @IsNotEmpty()
  @IsString()
  readonly accountId: string

  readonly roles: string[]
  readonly actives: boolean[]

  constructor(contractId: string, accountId: string, roles: string[], actives: boolean[]) {
    this.contractId = contractId
    this.accountId = accountId
    this.roles = roles
    this.actives = actives
  }
}
