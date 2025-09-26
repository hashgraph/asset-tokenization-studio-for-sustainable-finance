// SPDX-License-Identifier: Apache-2.0
export default interface DecodeLogResponse {
  logTimestamp: string
  transactionHash: string
  name: string
  signature: string
  [key: string]: any
}
