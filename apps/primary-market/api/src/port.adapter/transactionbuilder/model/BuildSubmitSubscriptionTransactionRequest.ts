// SPDX-License-Identifier: Apache-2.0

import { BaseBuildTransactionRequest } from "@hashgraph/green-bonds-shared-core"

export class BuildSubmitSubscriptionTransactionRequest extends BaseBuildTransactionRequest {
  offeringId: number
  lotUnits: string
}
