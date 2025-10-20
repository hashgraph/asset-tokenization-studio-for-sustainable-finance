// SPDX-License-Identifier: Apache-2.0

import { BaseBuildTransactionRequest } from '@hashgraph/green-bonds-shared-core'

export class BuildGrantRoleTransactionRequest extends BaseBuildTransactionRequest {
  role: string
  userAccountId: string
}
