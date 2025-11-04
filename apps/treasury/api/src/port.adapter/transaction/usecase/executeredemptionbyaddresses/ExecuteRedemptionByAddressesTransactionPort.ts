// SPDX-License-Identifier: Apache-2.0

import { MultipleTransactionResponse } from "@port/shared/model/MultipleTransactionResponse"
import { ExecuteRedemptionByAddressesTransactionRequest } from "@port/transaction/usecase/executeredemptionbyaddresses/model/ExecuteRedemptionByAddressesTransactionRequest"

export interface ExecuteRedemptionByAddressesTransactionPort {
  executeRedemptionByAddresses(
    treasuryContractId: string,
    request: ExecuteRedemptionByAddressesTransactionRequest,
  ): Promise<MultipleTransactionResponse>
}
