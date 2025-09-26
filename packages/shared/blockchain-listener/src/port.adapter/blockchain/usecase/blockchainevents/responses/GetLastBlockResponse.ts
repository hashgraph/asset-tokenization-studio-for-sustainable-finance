// SPDX-License-Identifier: Apache-2.0
export default interface GetLastBlockResponse {
  blocks: GetLastBlocksResponse[]
}

interface GetLastBlocksResponse {
  number: number
}
