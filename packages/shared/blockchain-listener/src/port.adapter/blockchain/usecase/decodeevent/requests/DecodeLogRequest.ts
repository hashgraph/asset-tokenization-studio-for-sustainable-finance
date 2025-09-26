// SPDX-License-Identifier: Apache-2.0
export default interface DecodeLogRequest {
  timestamp: string
  transactionHash: string
  data: string
  topics: string[]
}
