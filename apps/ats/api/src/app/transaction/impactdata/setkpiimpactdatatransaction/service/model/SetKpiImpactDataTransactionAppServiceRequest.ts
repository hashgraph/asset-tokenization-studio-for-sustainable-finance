// SPDX-License-Identifier: Apache-2.0
import { BaseTransactionAppServiceRequest } from "@hashgraph/green-bonds-shared-core"
import { ImpactDataRequest } from "@port/shared/model/KpiRequest"

export class SetKpiImpactDataTransactionAppServiceRequest extends BaseTransactionAppServiceRequest {
  impactData: ImpactDataRequest

  constructor(format: string, accountId: string, contractId: string, impactData: ImpactDataRequest) {
    super(format, accountId, contractId)
    this.impactData = impactData
  }
}
