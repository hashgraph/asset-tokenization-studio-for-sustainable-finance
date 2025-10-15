// SPDX-License-Identifier: Apache-2.0

export class BondResponse {
  id: string
  contractId: string
  treasuryId: string
  kpiId: string
  name: string
  symbol: string
  isin: string
  decimals: number
  currency: string
  nominalValue: string
  startingDate: Date
  maturityDate: Date
  maxSupply: string
}
