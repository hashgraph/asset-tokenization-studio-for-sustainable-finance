// SPDX-License-Identifier: Apache-2.0

import { GetBondResponse } from './model/GetBondResponse'

export interface GetBondPort {
  getBond(contractAddress: string): Promise<GetBondResponse>
}
