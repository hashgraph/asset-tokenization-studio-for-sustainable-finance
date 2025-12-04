// SPDX-License-Identifier: Apache-2.0
import { RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { TransferByPartitionTransactionRequest } from "./model/TransferByPartitionTransactionRequest"
import { Body, Param, Post } from "@nestjs/common"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import { TransferByPartitionTransactionPort } from "./TransferByPartitionTransactionPort"
import { TransferByPartitionTransactionAppServiceRequest } from "@app/bond/transaction/transferbypartitiontransaction/service/model/TransferByPartitionTransactionAppServiceRequest"
import { TransferByPartitionTransactionAppService } from "@app/bond/transaction/transferbypartitiontransaction/service/TransferByPartitionTransactionAppService"

@ApiTags("ATS")
@RestController("bonds")
export class TransferByPartitionTransactionHttpAdapter implements TransferByPartitionTransactionPort {
  constructor(private readonly transferByPartitionTransactionAppService: TransferByPartitionTransactionAppService) {}

  @ApiOperation({ summary: "Transfer bond tokens by partition" })
  @ApiResponse({ status: 201, type: TransactionResponse })
  @Post(":bondContractId/holders/:toAccountId/transfers")
  async transferByPartitionTransaction(
    @Param("bondContractId") bondContractId: string,
    @Param("toAccountId") toAccountId: string,
    @Body() request: TransferByPartitionTransactionRequest,
  ): Promise<TransactionResponse> {
    const appServiceRequest = new TransferByPartitionTransactionAppServiceRequest(
      request.format,
      request.accountId ?? "",
      bondContractId,
      toAccountId,
      request.partition,
      request.amount,
      request.data,
    )

    return await this.transferByPartitionTransactionAppService.execute(appServiceRequest)
  }
}
