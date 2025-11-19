// SPDX-License-Identifier: Apache-2.0

import { Query } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsString } from "class-validator"
import type { FactoryQueryResponse } from "./FactoryQueryResponse"

export class GetFactoryQuery extends Query<FactoryQueryResponse> {
  @IsNotEmpty()
  @IsString()
  readonly factoryId: string

  constructor(factoryId: string) {
    super()
    this.factoryId = factoryId
  }
}
