// SPDX-License-Identifier: Apache-2.0

import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { IsNotEmpty, IsString, IsNumber } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class DeployPrimaryMarketTransactionRequest extends BaseTransactionRequest {
  @ApiProperty({
    description: "The Hedera contract ID of the resolver contract",
    example: "0.0.123456",
  })
  @IsString()
  @IsNotEmpty()
  resolverContractId: string

  @ApiProperty({
    description: "The version number of the primary market configuration",
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  configVersion: number
}
