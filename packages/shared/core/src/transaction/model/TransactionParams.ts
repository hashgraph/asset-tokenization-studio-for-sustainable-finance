// SPDX-License-Identifier: Apache-2.0

import { BaseContract } from "ethers"
import { Environment } from "../Environment"

export type TransactionFormat = "hedera" | "ethereum"

export interface TransactionParams<C extends BaseContract> {
  readonly contractInstance: C
  readonly functionName: string
  readonly contractId: string
  readonly gas: number
  readonly args: any[]
  readonly environment: Environment
  readonly account: string
  readonly contractEvmAddress: string
  readonly format: TransactionFormat
}
