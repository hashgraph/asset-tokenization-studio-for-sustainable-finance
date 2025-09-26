// SPDX-License-Identifier: Apache-2.0
import {
  GetContractsResultsResultsByBlockNumberResponse,
  GetContractsResultsLinksByBlockNumberResponse,
} from "./GetContractsResultsByBlockNumberResponse"

export default interface GetNextContractsResultsByBlockNumberResponse {
  results: GetContractsResultsResultsByBlockNumberResponse[]
  links: GetContractsResultsLinksByBlockNumberResponse
}
