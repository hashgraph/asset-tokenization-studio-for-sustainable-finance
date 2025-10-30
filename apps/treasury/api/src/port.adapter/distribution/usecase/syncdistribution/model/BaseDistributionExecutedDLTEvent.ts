// SPDX-License-Identifier: Apache-2.0

import { DLTEvent } from "@hashgraph/green-bonds-shared-core"

export abstract class BaseDistributionExecutedDLTEvent extends DLTEvent {
  readonly distributionId: string
  readonly successAddresses: string[]
  readonly failedAddresses: string[]
  readonly alreadyPaidAddresses: string[]
  readonly paidAmounts: string[]

  constructor(
    contractId: string,
    transactionHash: string,
    distributionId: string,
    successAddresses: string[],
    failedAddresses: string[],
    alreadyPaidAddresses: string[],
    paidAmounts: string[],
  ) {
    super(contractId, transactionHash)
    this.distributionId = distributionId
    this.successAddresses = successAddresses
    this.failedAddresses = failedAddresses
    this.alreadyPaidAddresses = alreadyPaidAddresses
    this.paidAmounts = paidAmounts
  }
}
