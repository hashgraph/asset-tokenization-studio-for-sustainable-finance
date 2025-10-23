// SPDX-License-Identifier: Apache-2.0

import { TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { ExternalTransferPaymentTokenTransactionRequest } from "@port/transaction/usecase/externaltransferpaymenttoken/model/ExternalTransferPaymentTokenTransactionRequest"

export interface ExternalTransferPaymentTokenTransactionPort {
  externalTransferPaymentToken(
    paymentTokenContractId: string,
    treasuryContractId: string,
    request: ExternalTransferPaymentTokenTransactionRequest,
  ): Promise<TransactionResponse>
}
