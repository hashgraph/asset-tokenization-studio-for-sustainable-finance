// SPDX-License-Identifier: Apache-2.0
export default interface GetContractsResultsByBlockNumberResponse {
  results: GetContractsResultsResultsByBlockNumberResponse[]
  links: GetContractsResultsLinksByBlockNumberResponse
}

export interface GetContractsResultsLinksByBlockNumberResponse {
  next: string
}

export interface GetContractsResultsResultsByBlockNumberResponse {
  hash: string
  address: string
  contract_id: string
  to: string
}
