// SPDX-License-Identifier: Apache-2.0

export class HolderBalancesResponse {
  id: string
  contractId: string
  holderAccountId: string
  partition: string
  availableBalance: string
  lockedBalance: string
  heldBalance: string
  clearingBalance: string
}
