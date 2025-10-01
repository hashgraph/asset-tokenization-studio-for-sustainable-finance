// SPDX-License-Identifier: Apache-2.0

import { FundBeneficiaryTransactionHttpAdapter } from "@port/transaction/usecase/fundbeneficiarytransaction/FundBeneficiaryTransactionHttpAdapter"
import { FundBeneficiaryTransactionAppService } from "@app/transaction/fundbeneficiarytransaction/service/FundBeneficiaryTransactionAppService"
import { TransactionBuilderAdapter } from "@port/transactionbuilder/TransactionBuilderAdapter"

export const CONTROLLERS = [FundBeneficiaryTransactionHttpAdapter]

export const PROVIDERS = [
  FundBeneficiaryTransactionAppService,
  {
    provide: "TransactionBuilderPort",
    useClass: TransactionBuilderAdapter,
  },
]
