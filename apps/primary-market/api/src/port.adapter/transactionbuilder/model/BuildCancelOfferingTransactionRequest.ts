// SPDX-License-Identifier: Apache-2.0

import { BaseBuildTransactionRequest } from "@hashgraph/green-bonds-shared-core"

export class BuildCancelOfferingTransactionRequest extends BaseBuildTransactionRequest {
  offeringId: number
  start: string
  end: string
}
