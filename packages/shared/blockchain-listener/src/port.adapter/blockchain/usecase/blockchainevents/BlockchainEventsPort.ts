// SPDX-License-Identifier: Apache-2.0
import GetBlockRequest from "./requests/GetBlockRequest"
import GetBlockResponse from "./responses/GetBlockResponse"
import GetContractsResultsByBlockNumberRequest from "./requests/GetContractsResultsByBlockNumberRequest"
import GetContractsResultsByBlockNumberResponse from "./responses/GetContractsResultsByBlockNumberResponse"
import GetNextContractsResultsByBlockNumberRequest from "./requests/GetNextContractsResultsByBlockNumberRequest"
import GetNextContractsResultsByBlockNumberResponse from "./responses/GetNextContractsResultsByBlockNumberResponse"
import GetContractsResultsByBlockHashRequest from "./requests/GetContractsResultsByBlockHashRequest"
import GetContractsResultsByBlockHashResponse from "./responses/GetContractsResultsByBlockHashResponse"

export default interface BlockchainEventsPort {
  getBlock(request: GetBlockRequest): Promise<GetBlockResponse>
  getContractsResultsByBlockNumber(
    request: GetContractsResultsByBlockNumberRequest,
  ): Promise<GetContractsResultsByBlockNumberResponse>
  getNextContractsResultsByBlockNumber(
    request: GetNextContractsResultsByBlockNumberRequest,
  ): Promise<GetNextContractsResultsByBlockNumberResponse>
  getContractsResultsByBlockHash(
    request: GetContractsResultsByBlockHashRequest,
  ): Promise<GetContractsResultsByBlockHashResponse>
  getLastBlockNumber(): Promise<number>
}
