// SPDX-License-Identifier: Apache-2.0
import { TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { SetBondCouponTransactionRequest } from "./model/SetBondCouponTransactionRequest"

export interface SetBondCouponTransactionPort {
  setBondCouponTransaction(
    bondContractId: string,
    request: SetBondCouponTransactionRequest,
  ): Promise<TransactionResponse>
}
