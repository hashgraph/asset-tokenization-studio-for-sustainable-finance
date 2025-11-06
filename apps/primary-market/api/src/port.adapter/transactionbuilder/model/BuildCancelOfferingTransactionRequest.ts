// SPDX-License-Identifier: Apache-2.0

import { BaseBuildTransactionRequest } from "@hashgraph/green-bonds-shared-core"

export class BuildCancelOfferingTransactionRequest extends BaseBuildTransactionRequest {
  offeringDltId: string
  start: string
  end: string
}
