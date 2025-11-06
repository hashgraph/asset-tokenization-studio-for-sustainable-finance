// SPDX-License-Identifier: Apache-2.0

import { BaseBuildTransactionRequest } from "@hashgraph/green-bonds-shared-core"

export class BuildCancelSubscriptionTransactionRequest extends BaseBuildTransactionRequest {
  offeringDltId: string
  subscriptionDltId: string
}
