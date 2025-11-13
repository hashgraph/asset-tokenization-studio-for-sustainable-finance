// SPDX-License-Identifier: Apache-2.0
import { BondHolderBalance } from "../model/BondHolderBalance"

export interface BondHolderBalanceRepository {
  save(bondHolderBalance: BondHolderBalance): Promise<BondHolderBalance>
  findByContractIdHolderAccountIdAndPartition(
    bondContractId: string,
    holderAccountId: string,
    partition: string,
  ): Promise<BondHolderBalance | null>
}
