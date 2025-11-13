// SPDX-License-Identifier: Apache-2.0

import { Inject, RestController } from "@hashgraph/green-bonds-shared-core"
import { Get, Param, Query } from "@nestjs/common"
import type { QueryBus } from "@hashgraph/green-bonds-shared-core"
import { QueryPageRequest } from "@hashgraph/green-bonds-shared-core"
import { GetBondDocumentsPort } from "./GetBondDocumentsPort"
import { GetBondDocumentsQuery } from "@app/bond/getbonddocuments/query/GetBondDocumentsQuery"
import { BondDocumentsResponse } from "@port/bond/usecase/getbonddocuments/model/BondDocumentsResponse"

@RestController("bonds")
export class GetBondDocumentsHttpAdapter implements GetBondDocumentsPort {
  constructor(@Inject() private readonly queryBus: QueryBus) {}

  @Get("/:bondContractId/documents")
  async getBondDocuments(
    @Param("bondContractId") bondContractId: string,
    @Query() queryPageRequest: QueryPageRequest,
  ): Promise<BondDocumentsResponse> {
    const queryPageOptions = (queryPageRequest ?? QueryPageRequest.DEFAULT).toQueryPageOptions()
    return await this.queryBus.execute(new GetBondDocumentsQuery(bondContractId, queryPageOptions))
  }
}
