// SPDX-License-Identifier: Apache-2.0
import { Body, Param, Post } from "@nestjs/common"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import { RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { SetKpiImpactDataTransactionPort } from "@port/transaction/usecase/setkpiimpactdatatransaction/SetKpiImpactDataTransactionPort"
import { SetKpiImpactDataTransactionRequest } from "@port/transaction/usecase/setkpiimpactdatatransaction/model/SetKpiImpactDataTransactionRequest"
import { SetKpiImpactDataTransactionAppService } from "@app/transaction/impactdata/setkpiimpactdatatransaction/service/SetKpiImpactDataTransactionAppService"
import { SetKpiImpactDataTransactionAppServiceRequest } from "@app/transaction/impactdata/setkpiimpactdatatransaction/service/model/SetKpiImpactDataTransactionAppServiceRequest"

@ApiTags("ATS")
@RestController("bonds")
export class SetKpiImpactDataTransactionHttpAdapter implements SetKpiImpactDataTransactionPort {
  constructor(private readonly appService: SetKpiImpactDataTransactionAppService) {}

  @ApiOperation({ summary: "Set KPI impact data configuration for a bond" })
  @ApiResponse({ status: 201, type: TransactionResponse })
  @Post(":bondContractId/kpi/impact-data-transactions")
  async setImpactDataTransaction(
    @Param("bondContractId") bondContractId: string,
    @Body() request: SetKpiImpactDataTransactionRequest,
  ): Promise<TransactionResponse> {
    return await this.appService.execute(
      new SetKpiImpactDataTransactionAppServiceRequest(
        request.format,
        request.accountId ?? "",
        bondContractId,
        request.impactData,
      ),
    )
  }
}
