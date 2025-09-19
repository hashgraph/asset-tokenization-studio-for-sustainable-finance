// SPDX-License-Identifier: Apache-2.0
export default interface BlockchainEvent {
  timestamp: string
  name: string
  [key: string]: any
}
