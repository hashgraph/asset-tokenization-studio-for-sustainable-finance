// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty } from "class-validator"
import { Query } from "@hashgraph/green-bonds-shared-core"
import { GetBondKpiDataItemQueryResponse } from "./GetBondKpiDataItemQueryResponse"

export class GetBondKpiDataItemQuery extends Query<GetBondKpiDataItemQueryResponse> {
  @IsNotEmpty()
  readonly bondContractId: string

  @IsNotEmpty()
  readonly kpiDataId: string

  constructor(bondContractId: string, kpiDataId: string) {
    super()
    this.bondContractId = bondContractId
    this.kpiDataId = kpiDataId
  }
}
