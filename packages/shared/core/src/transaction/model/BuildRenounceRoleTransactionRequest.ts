// SPDX-License-Identifier: Apache-2.0

import { BaseBuildTransactionRequest } from "@transaction/model/BaseBuildTransactionRequest"

export class BuildRenounceRoleTransactionRequest extends BaseBuildTransactionRequest {
  roleId: string
}
