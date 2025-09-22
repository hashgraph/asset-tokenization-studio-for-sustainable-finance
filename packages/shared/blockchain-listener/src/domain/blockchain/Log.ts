// SPDX-License-Identifier: Apache-2.0

export default interface Log {
  timestamp: string
  transactionHash: string
  data: string
  topics: string[]
}
