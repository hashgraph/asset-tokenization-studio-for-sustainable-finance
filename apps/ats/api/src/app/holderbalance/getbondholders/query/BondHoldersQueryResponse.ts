// SPDX-License-Identifier: Apache-2.0

export class BondHoldersQueryResponse {
  id: string
  bondContractId: string
  holderAccountId: string
  partition: string
  availableBalance: string
  lockedBalance: string
}
