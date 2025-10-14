// SPDX-License-Identifier: Apache-2.0

import { Bond } from "@domain/bond/model/Bond"

export class BondQueryDTO {
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

  static fromDomain(bond: Bond): BondQueryDTO {
    const data = new BondQueryDTO()
    data.id = bond.id
    data.contractId = bond.contractId
    data.treasuryId = bond.treasuryId
    data.kpiId = bond.kpiId
    data.name = bond.name
    data.symbol = bond.symbol
    data.isin = bond.isin
    data.decimals = bond.decimals
    data.currency = bond.currency
    data.nominalValue = bond.nominalValue
    data.startingDate = bond.startingDate
    data.maturityDate = bond.maturityDate
    data.maxSupply = bond.maxSupply
    return data
  }
}
