// SPDX-License-Identifier: Apache-2.0
import { BaseBuildTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { ImpactDataRequest } from "@port/shared/model/KpiRequest"

export class BuildSetImpactDataTransactionRequest extends BaseBuildTransactionRequest {
  impactData: ImpactDataRequest
}
