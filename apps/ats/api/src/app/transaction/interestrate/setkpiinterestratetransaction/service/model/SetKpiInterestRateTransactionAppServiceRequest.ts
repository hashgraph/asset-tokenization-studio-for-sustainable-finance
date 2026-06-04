// SPDX-License-Identifier: Apache-2.0
import { BaseTransactionAppServiceRequest } from "@hashgraph/green-bonds-shared-core"
import { InterestRateRequest } from "@port/shared/model/KpiRequest"

export class SetKpiInterestRateTransactionAppServiceRequest extends BaseTransactionAppServiceRequest {
  interestRate: InterestRateRequest

  constructor(format: string, accountId: string, contractId: string, interestRate: InterestRateRequest) {
    super(format, accountId, contractId)
    this.interestRate = interestRate
  }
}
