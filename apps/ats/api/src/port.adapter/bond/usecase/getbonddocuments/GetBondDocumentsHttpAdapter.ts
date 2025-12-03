// SPDX-License-Identifier: Apache-2.0

import { Inject, PageResponse, RestController } from "@hashgraph/green-bonds-shared-core"
import { Get, Param, Query } from "@nestjs/common"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import type { QueryBus } from "@hashgraph/green-bonds-shared-core"
import { PageOptionsRequest } from "@hashgraph/green-bonds-shared-core"
import { GetBondDocumentsPort } from "./GetBondDocumentsPort"
import { GetBondDocumentsQuery } from "@app/bond/getbonddocuments/query/GetBondDocumentsQuery"
import { BondDocumentResponse } from "@port/bond/usecase/getbonddocuments/model/BondDocumentsResponse"

@ApiTags("ATS")
@RestController("bonds")
export class GetBondDocumentsHttpAdapter implements GetBondDocumentsPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: "Get bond documents" })
  @ApiResponse({ status: 200, type: BondDocumentResponse, isArray: true })
  @Get("/:bondContractId/documents")
  async getBondDocuments(
    @Param("bondContractId") bondContractId: string,
    @Query() pageOptionsRequest: PageOptionsRequest,
  ): Promise<PageResponse<BondDocumentResponse>> {
    const queryPageOptions = (pageOptionsRequest ?? PageOptionsRequest.DEFAULT).toQueryPageOptions()
    const query = new GetBondDocumentsQuery(bondContractId, queryPageOptions)
    return await this.queryBus.execute(query)
  }
}
