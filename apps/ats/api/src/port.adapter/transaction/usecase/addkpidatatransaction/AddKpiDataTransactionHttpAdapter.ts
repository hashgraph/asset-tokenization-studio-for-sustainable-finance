// SPDX-License-Identifier: Apache-2.0
import { Body, Param, Post } from "@nestjs/common"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import { RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { AddKpiDataTransactionPort } from "@port/transaction/usecase/addkpidatatransaction/AddKpiDataTransactionPort"
import { AddKpiDataTransactionRequest } from "@port/transaction/usecase/addkpidatatransaction/model/AddKpiDataTransactionRequest"
import { AddKpiDataTransactionAppService } from "@app/transaction/kpidata/addkpidatatransaction/service/AddKpiDataTransactionAppService"
import { AddKpiDataTransactionAppServiceRequest } from "@app/transaction/kpidata/addkpidatatransaction/service/model/AddKpiDataTransactionAppServiceRequest"

@ApiTags("ATS")
@RestController("bonds")
export class AddKpiDataTransactionHttpAdapter implements AddKpiDataTransactionPort {
  constructor(private readonly appService: AddKpiDataTransactionAppService) {}

  @ApiOperation({ summary: "Add a KPI data point for a bond" })
  @ApiResponse({ status: 201, type: TransactionResponse })
  @Post(":bondContractId/kpi/data-transactions")
  async addKpiDataTransaction(
    @Param("bondContractId") bondContractId: string,
    @Body() request: AddKpiDataTransactionRequest,
  ): Promise<TransactionResponse> {
    return await this.appService.execute(
      new AddKpiDataTransactionAppServiceRequest(
        request.format,
        request.accountId ?? "",
        bondContractId,
        request.date,
        request.value,
        request.projectAddress,
      ),
    )
  }
}
