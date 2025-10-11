// SPDX-License-Identifier: Apache-2.0

import { GetBondQueryResponse } from '@app/bond/getbond/query/GetBondQueryResponse'

export class GetBondResponse {
  readonly id: string
  readonly contractId: string
  readonly treasuryId: string
  readonly kpiId: string
  readonly name: string
  readonly symbol: string
  readonly decimals: number
  readonly currency: string
  readonly nominalValue: string
  readonly startingDate: Date
  readonly maturityDate: Date
  readonly maxSupply: string
  readonly isin: string

  static fromGetBondQueryResponse(this: void, queryResponse: GetBondQueryResponse): GetBondResponse {
    const response = new GetBondResponse()
    Object.assign(response, {
      id: queryResponse.id,
      contractId: queryResponse.contractId,
      treasuryId: queryResponse.treasuryId,
      kpiId: queryResponse.kpiId,
      name: queryResponse.name,
      symbol: queryResponse.symbol,
      decimals: queryResponse.decimals,
      currency: queryResponse.currency,
      nominalValue: queryResponse.nominalValue,
      startingDate: queryResponse.startingDate,
      maturityDate: queryResponse.maturityDate,
      maxSupply: queryResponse.maxSupply,
      isin: queryResponse.isin,
    })
    return response
  }
}
