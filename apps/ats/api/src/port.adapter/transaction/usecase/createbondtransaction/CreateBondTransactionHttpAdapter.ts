// SPDX-License-Identifier: Apache-2.0
import { ConverterUtils, RestController, TransactionResponse } from "@hashgraph/green-bonds-shared-core"
import { CreateBondTransactionRequest } from "./model/CreateBondTransactionRequest"
import { Body, Post } from "@nestjs/common"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import { CreateBondTransactionAppService } from "@app/bond/transaction/createbondtransaction/service/CreateBondTransactionAppService"
import { CreateBondTransactionAppServiceRequest } from "@app/bond/transaction/createbondtransaction/service/model/CreateBondTransactionAppServiceRequest"
import { CreateBondTransactionPort } from "./CreateBondTransactionPort"
import { ConfigService } from "@nestjs/config"

@ApiTags("ATS")
@RestController("bonds")
export class CreateBondTransactionHttpAdapter implements CreateBondTransactionPort {
  constructor(
    private readonly createBondTransactionAppService: CreateBondTransactionAppService,
    private readonly configService: ConfigService,
  ) {}

  @ApiOperation({ summary: "Create a new bond" })
  @ApiResponse({ status: 201, type: TransactionResponse })
  @Post()
  async createBondTransaction(@Body() request: CreateBondTransactionRequest): Promise<TransactionResponse> {
    const factorySuiteEvmAddress = this.configService.get<string>("BLOCKCHAIN_LISTENER_CONTRACTS") ?? ""
    const factorySuiteContractId = await ConverterUtils.getHederaAddressFromEvm(factorySuiteEvmAddress)

    const appServiceRequest = new CreateBondTransactionAppServiceRequest(
      request.format,
      request.accountId ?? "",
      factorySuiteContractId,
      request.securityTokenToCreate,
      request.factoryRegulationData,
      request.treasuryData,
      request.kpiData,
      request.factoryAddress,
    )

    return await this.createBondTransactionAppService.execute(appServiceRequest)
  }
}
