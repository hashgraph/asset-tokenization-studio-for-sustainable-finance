// SPDX-License-Identifier: Apache-2.0

export class BondQueryResponse {
  id: string
  contractId: string
  treasuryId: string
  name: string
  symbol: string
  isin: string
  decimals: number
  currency: string
  nominalValue: string
  nominalValueDecimals: number
  startingDate: Date
  maturityDate: Date
  maxSupply: string
  isPaused: boolean
}
