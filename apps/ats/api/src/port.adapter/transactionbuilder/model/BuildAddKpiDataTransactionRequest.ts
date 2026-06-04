// SPDX-License-Identifier: Apache-2.0
import { BaseBuildTransactionRequest } from "@hashgraph/green-bonds-shared-core"

export class BuildAddKpiDataTransactionRequest extends BaseBuildTransactionRequest {
  date: string
  value: string
  projectAddress: string
}
