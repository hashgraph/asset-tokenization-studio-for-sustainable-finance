// SPDX-License-Identifier: Apache-2.0

import { IsNotEmpty, IsString } from "class-validator"

export class SyncUserRolesAppServiceRequest {
  @IsNotEmpty()
  @IsString()
  readonly treasuryContractId: string

  @IsNotEmpty()
  @IsString()
  readonly accountId: string

  readonly roles: string[]
  readonly actives: boolean[]
}
