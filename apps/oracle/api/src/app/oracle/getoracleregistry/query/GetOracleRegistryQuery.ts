// SPDX-License-Identifier: Apache-2.0
import { IsNotEmpty, IsString } from "class-validator"
import { Query } from "@hashgraph/green-bonds-shared-core"
import { OracleRegistryQueryResponse } from "./OracleRegistryQueryResponse"

export class GetOracleRegistryQuery extends Query<OracleRegistryQueryResponse> {
  @IsNotEmpty()
  @IsString()
  id: string

  constructor(id: string) {
    super()
    this.id = id
  }
}
