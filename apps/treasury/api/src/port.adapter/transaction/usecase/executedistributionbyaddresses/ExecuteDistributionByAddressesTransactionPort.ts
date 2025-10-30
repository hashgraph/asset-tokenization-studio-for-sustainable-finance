// SPDX-License-Identifier: Apache-2.0

import { ExecuteDistributionByAddressesTransactionRequest } from "@port/transaction/usecase/executedistributionbyaddresses/model/ExecuteDistributionByAddressesTransactionRequest"
import { MultipleTransactionResponse } from "@port/shared/model/MultipleTransactionResponse"

export interface ExecuteDistributionByAddressesTransactionPort {
  executeDistributionByAddresses(
    treasuryContractId: string,
    distributionId: number,
    request: ExecuteDistributionByAddressesTransactionRequest,
  ): Promise<MultipleTransactionResponse>
}
