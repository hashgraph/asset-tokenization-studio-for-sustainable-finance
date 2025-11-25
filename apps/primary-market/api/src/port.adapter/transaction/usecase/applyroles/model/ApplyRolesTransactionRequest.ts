// SPDX-License-Identifier: Apache-2.0

import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { IsArray } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class ApplyRolesTransactionRequest extends BaseTransactionRequest {
  @ApiProperty({
    description: "Array of role IDs to grant to the user",
    example: ["0x0000000000000000000000000000000000000000000000000000000000000000"],
    type: [String],
  })
  @IsArray()
  rolesToGrant: string[]

  @ApiProperty({
    description: "Array of role IDs to revoke from the user",
    example: ["0x0000000000000000000000000000000000000000000000000000000000000001"],
    type: [String],
  })
  @IsArray()
  rolesToRevoke: string[]

  constructor(format: string, accountId: string, rolesToGrant: string[] = [], rolesToRevoke: string[] = []) {
    super(format, accountId)
    this.rolesToGrant = rolesToGrant
    this.rolesToRevoke = rolesToRevoke
  }
}
