// SPDX-License-Identifier: Apache-2.0

import { Investor } from "../model/Investor"

export interface InvestorRepository {
  save(investor: Investor): Promise<Investor>
  findByAccountId(accountId: string): Promise<Investor | null>
}
