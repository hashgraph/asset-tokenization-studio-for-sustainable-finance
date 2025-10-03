// SPDX-License-Identifier: Apache-2.0

import { GetTreasuryPositionsResponse } from "@port/treasury/usecase/gettreasurypositions/model/GetTreasuryPositionsResponse"

export interface GetTreasuryPositionsPort {
  getTreasuryPositions(bondContractAddress: string): Promise<GetTreasuryPositionsResponse>
}
