// SPDX-License-Identifier: Apache-2.0

import { Body, Param, Post } from "@nestjs/common"
import {
  RestController,
  TransactionResponse,
  UnpauseTransactionAppService,
  UnpauseTransactionAppServiceRequest,
} from "@hashgraph/green-bonds-shared-core"

import { UnpausePrimaryMarketTransactionRequest } from "./model/UnpausePrimaryMarketTransactionRequest"
import { UnpausePrimaryMarketTransactionPort } from "@port/transaction/usecase/unpauseprimarymarket/UnpausePrimaryMarketTransactionPort"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"

@ApiTags("Primary Market")
@RestController("primary-markets")
export class UnpausePrimaryMarketTransactionHttpAdapter implements UnpausePrimaryMarketTransactionPort {
  constructor(private readonly unpauseTransactionAppService: UnpauseTransactionAppService) {}

  @ApiOperation({ summary: "Unpauses the primary market contract" })
  @ApiResponse({ status: 201, description: "OK", type: TransactionResponse })
  @Post(":marketContractId/unpause")
  async unpausePrimaryMarket(
    @Param("marketContractId") marketContractId: string,
    @Body() request: UnpausePrimaryMarketTransactionRequest,
  ): Promise<TransactionResponse> {
    return await this.unpauseTransactionAppService.execute(
      new UnpauseTransactionAppServiceRequest(request.format, request.accountId!, marketContractId),
    )
  }
}
