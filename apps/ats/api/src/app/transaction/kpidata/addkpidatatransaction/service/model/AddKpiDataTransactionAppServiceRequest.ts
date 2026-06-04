// SPDX-License-Identifier: Apache-2.0
import { BaseTransactionAppServiceRequest } from "@hashgraph/green-bonds-shared-core"

export class AddKpiDataTransactionAppServiceRequest extends BaseTransactionAppServiceRequest {
  date: string
  value: string
  projectAddress: string

  constructor(
    format: string,
    accountId: string,
    contractId: string,
    date: string,
    value: string,
    projectAddress: string,
  ) {
    super(format, accountId, contractId)
    this.date = date
    this.value = value
    this.projectAddress = projectAddress
  }
}
