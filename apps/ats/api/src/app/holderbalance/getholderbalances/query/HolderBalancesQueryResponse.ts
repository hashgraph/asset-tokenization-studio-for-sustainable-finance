// SPDX-License-Identifier: Apache-2.0

export class HolderBalancesQueryResponse {
  id: string
  contractId: string
  holderAccountId: string
  partition: string
  availableBalance: string
  lockedBalance: string
  heldBalance: string
  clearingBalance: string
}
