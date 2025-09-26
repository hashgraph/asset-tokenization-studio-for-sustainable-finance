// SPDX-License-Identifier: Apache-2.0
export default interface GetContractsResultsByBlockHashResponse {
  timestamp: string
  logs: GetContractsResultsLogsByBlockHashResponse[]
}

interface GetContractsResultsLogsByBlockHashResponse {
  data: string
  topics: string[]
}
