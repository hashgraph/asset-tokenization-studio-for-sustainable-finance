// SPDX-License-Identifier: Apache-2.0
import { BaseEntity } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsString } from "class-validator"

export class BondDocument extends BaseEntity {
  @IsNotEmpty()
  @IsString()
  name: string

  @IsNotEmpty()
  @IsString()
  contractId: string

  @IsNotEmpty()
  @IsString()
  uri: string

  @IsNotEmpty()
  @IsString()
  hash: string
}
