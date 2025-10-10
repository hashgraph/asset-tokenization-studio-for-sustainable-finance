// SPDX-License-Identifier: Apache-2.0

export class GetBondQueryResponse {
  readonly id: string
  readonly contractId: string
  readonly name: string
  readonly symbol: string
  readonly decimals: number
  readonly currency: string
  readonly nominalValue: string
  readonly startingDate: Date
  readonly maturityDate: Date
  readonly maxSupply: string
  readonly isin: string
}
