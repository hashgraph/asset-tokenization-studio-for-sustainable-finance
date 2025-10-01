// SPDX-License-Identifier: Apache-2.0

import { BaseContract } from "ethers"

export interface TransactionParams<C extends BaseContract> {
  readonly contractInstance: C
  readonly functionName: string
  readonly contractId: string
  readonly gas: number
  readonly args: any[]
}
