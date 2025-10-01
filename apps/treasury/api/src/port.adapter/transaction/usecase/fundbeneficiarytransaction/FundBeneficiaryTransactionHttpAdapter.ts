// SPDX-License-Identifier: Apache-2.0

import { Body, Controller, Post } from "@nestjs/common"
import { TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { FundBeneficiaryTransactionRequest } from "./model/FundBeneficiaryTransactionRequest"
import { FundBeneficiaryTransactionAppService } from "../../../../app/transaction/fundbeneficiarytransaction/service/FundBeneficiaryTransactionAppService"
import { FundBeneficiaryTransactionAppServiceRequest } from "../../../../app/transaction/fundbeneficiarytransaction/service/model/FundBeneficiaryTransactionAppServiceRequest"

@Controller("beneficiaries")
export class FundBeneficiaryTransactionHttpAdapter {
  constructor(private readonly fundBeneficiaryTransactionAppService: FundBeneficiaryTransactionAppService) {}

  @Post("fund")
  fundBeneficiary(@Body() request: FundBeneficiaryTransactionRequest): TransactionResponse {
    const appServiceRequest = new FundBeneficiaryTransactionAppServiceRequest(
      request.address,
      request.amount,
      request.format,
    )
    return this.fundBeneficiaryTransactionAppService.execute(appServiceRequest)
  }
}
