// SPDX-License-Identifier: Apache-2.0

import { Body, Param, Post } from "@nestjs/common"
import {
  PauseTransactionAppService,
  PauseTransactionAppServiceRequest,
  RestController,
  TransactionResponse,
} from "@hashgraph/green-bonds-shared-core"

import { PauseBondTransactionPort } from "@port/transaction/usecase/pausebondtransaction/PauseBondTransactionPort"
import { PauseBondTransactionRequest } from "@port/transaction/usecase/pausebondtransaction/model/PauseBondTransactionRequest"

@RestController("bonds")
export class PauseBondTransactionHttpAdapter implements PauseBondTransactionPort {
  constructor(private readonly pauseTransactionAppService: PauseTransactionAppService) {}

  @Post(":bondContractId/pause")
  async pauseBond(
    @Param("bondContractId") bondContractId: string,
    @Body() request: PauseBondTransactionRequest,
  ): Promise<TransactionResponse> {
    return await this.pauseTransactionAppService.execute(
      new PauseTransactionAppServiceRequest(request.format, request.accountId!, bondContractId),
    )
  }
}
