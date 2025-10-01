// SPDX-License-Identifier: Apache-2.0

import { SharedModule } from "@hashgraph/green-bonds-shared-core"
import { Module } from "@nestjs/common"
import { FundBeneficiaryTransactionHttpAdapter } from "@port/transaction/usecase/fundbeneficiarytransaction/FundBeneficiaryTransactionHttpAdapter"
import { FundBeneficiaryTransactionAppService } from "@app/transaction/fundbeneficiarytransaction/service/FundBeneficiaryTransactionAppService"
import { TransactionBuilderAdapter } from "@port/transactionbuilder/TransactionBuilderAdapter"

@Module({
  imports: [SharedModule],
  controllers: [FundBeneficiaryTransactionHttpAdapter],
  providers: [
    FundBeneficiaryTransactionAppService,
    {
      provide: "TransactionBuilderPort",
      useClass: TransactionBuilderAdapter,
    },
  ],
})
export class AppModule {}
