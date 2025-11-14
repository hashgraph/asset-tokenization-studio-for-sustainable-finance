// SPDX-License-Identifier: Apache-2.0

import { BaseBuildTransactionRequest } from "@transaction/model/BaseBuildTransactionRequest"

export class BuildApplyRolesTransactionRequest extends BaseBuildTransactionRequest {
  roles: string[]
  actives: boolean[]
  userAccountId: string
}
