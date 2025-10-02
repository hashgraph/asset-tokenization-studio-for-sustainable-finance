// SPDX-License-Identifier: Apache-2.0

import { Environment } from "../Environment"
import { Interface } from "ethers/lib/utils"

export type TransactionFormat = "hedera" | "ethereum"

export interface TransactionParams<I extends Interface> {
  readonly contractInterface: I
  readonly functionName: string
  readonly contractId?: string
  readonly gas: number
  readonly args: any[]
  readonly environment: Environment
  readonly account?: string
  readonly contractEvmAddress?: string
  readonly format: TransactionFormat
}
