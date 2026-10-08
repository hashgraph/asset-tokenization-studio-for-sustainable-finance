// SPDX-License-Identifier: Apache-2.0

import { Body, Param, Post } from "@nestjs/common"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import {
  RestController,
  TransactionResponse,
  UnpauseTransactionAppService,
  UnpauseTransactionAppServiceRequest,
} from "@hashgraph/green-bonds-shared-core"

import { UnpauseBondTransactionRequest } from "./model/UnpauseBondTransactionRequest"
import { UnpauseBondTransactionPort } from "@port/transaction/usecase/unpausebond/UnpauseBondTransactionPort"

@ApiTags("ATS")
@RestController("bonds")
export class UnpauseBondTransactionHttpAdapter implements UnpauseBondTransactionPort {
  constructor(private readonly unpauseTransactionAppService: UnpauseTransactionAppService) {}

  @ApiOperation({ summary: "Unpause a bond" })
  @ApiResponse({ status: 201, type: TransactionResponse })
  @Post(":bondContractId/unpause")
  async unpauseBond(
    @Param("bondContractId") bondContractId: string,
    @Body() request: UnpauseBondTransactionRequest,
  ): Promise<TransactionResponse> {
    return await this.unpauseTransactionAppService.execute(
      new UnpauseTransactionAppServiceRequest(request.format, request.accountId!, bondContractId),
    )
  }
}
