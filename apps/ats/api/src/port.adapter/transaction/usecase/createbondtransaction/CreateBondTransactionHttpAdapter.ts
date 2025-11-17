// SPDX-License-Identifier: Apache-2.0
import { RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { CreateBondTransactionRequest } from "./model/CreateBondTransactionRequest"
import { Body, Post } from "@nestjs/common"
import { CreateBondTransactionAppService } from "@app/bond/transaction/createbondtransaction/service/CreateBondTransactionAppService"
import { CreateBondTransactionAppServiceRequest } from "@app/bond/transaction/createbondtransaction/service/model/CreateBondTransactionAppServiceRequest"
import { CreateBondTransactionPort } from "./CreateBondTransactionPort"

@RestController("bonds")
export class CreateBondTransactionHttpAdapter implements CreateBondTransactionPort {
  constructor(private readonly createBondTransactionAppService: CreateBondTransactionAppService) {}

  @Post()
  async createBondTransaction(@Body() request: CreateBondTransactionRequest): Promise<TransactionResponse> {
    const appServiceRequest = new CreateBondTransactionAppServiceRequest(
      request.format,
      request.accountId ?? "",
      request.factorySuiteAddress,
      request.securityTokenToCreate,
      request.factoryRegulationData,
      request.treasuryData,
      request.kpiData,
      request.factoryAddress,
    )

    return await this.createBondTransactionAppService.execute(appServiceRequest)
  }
}
