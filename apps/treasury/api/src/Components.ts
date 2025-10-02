// SPDX-License-Identifier: Apache-2.0

import { FundProceedsRecipientTransactionHttpAdapter } from "@port/transaction/usecase/fundproceedsrecipienttransaction/FundProceedsRecipientTransactionHttpAdapter"
import { FundProceedsRecipientTransactionAppService } from "@app/transaction/fundproceedsrecipienttransaction/service/FundProceedsRecipientTransactionAppService"
import { TransactionBuilderAdapter } from "@port/transactionbuilder/TransactionBuilderAdapter"

export const CONTROLLERS = [FundProceedsRecipientTransactionHttpAdapter]

export const PROVIDERS = [
  FundProceedsRecipientTransactionAppService,
  {
    provide: "TransactionBuilderPort",
    useClass: TransactionBuilderAdapter,
  },
]
