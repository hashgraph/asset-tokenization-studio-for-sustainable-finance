// SPDX-License-Identifier: Apache-2.0

export class TreasuryQueryResponse {
  readonly contractId: string
  readonly bondContractId: string
  readonly paused: boolean
  readonly createdAt: Date
}
