// SPDX-License-Identifier: Apache-2.0
import { BaseBuildTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { InterestRateRequest } from "@port/shared/model/KpiRequest"

export class BuildSetInterestRateTransactionRequest extends BaseBuildTransactionRequest {
  interestRate: InterestRateRequest
}
