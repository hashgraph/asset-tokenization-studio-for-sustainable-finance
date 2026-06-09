// SPDX-License-Identifier: Apache-2.0
import { Body, Param, Post } from "@nestjs/common"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import { RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { SetKpiInterestRateTransactionPort } from "@port/transaction/usecase/setkpiinterestratetransaction/SetKpiInterestRateTransactionPort"
import { SetKpiInterestRateTransactionRequest } from "@port/transaction/usecase/setkpiinterestratetransaction/model/SetKpiInterestRateTransactionRequest"
import { SetKpiInterestRateTransactionAppService } from "@app/transaction/interestrate/setkpiinterestratetransaction/service/SetKpiInterestRateTransactionAppService"
import { SetKpiInterestRateTransactionAppServiceRequest } from "@app/transaction/interestrate/setkpiinterestratetransaction/service/model/SetKpiInterestRateTransactionAppServiceRequest"

@ApiTags("ATS")
@RestController("bonds")
export class SetKpiInterestRateTransactionHttpAdapter implements SetKpiInterestRateTransactionPort {
  constructor(private readonly appService: SetKpiInterestRateTransactionAppService) {}

  @ApiOperation({ summary: "Set KPI interest rate configuration for a bond" })
  @ApiResponse({ status: 201, type: TransactionResponse })
  @Post(":bondContractId/kpi/interest-rate-transactions")
  async setInterestRateTransaction(
    @Param("bondContractId") bondContractId: string,
    @Body() request: SetKpiInterestRateTransactionRequest,
  ): Promise<TransactionResponse> {
    return await this.appService.execute(
      new SetKpiInterestRateTransactionAppServiceRequest(
        request.format,
        request.accountId ?? "",
        bondContractId,
        request.interestRate,
      ),
    )
  }
}
