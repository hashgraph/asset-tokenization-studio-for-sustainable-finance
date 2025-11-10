// SPDX-License-Identifier: Apache-2.0

import { BaseBuildTransactionRequest } from "@transaction/model/BaseBuildTransactionRequest"

export class BuildGrantRoleTransactionRequest extends BaseBuildTransactionRequest {
  roleId: string
  userAccountId: string
}
