// SPDX-License-Identifier: Apache-2.0

import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { IsArray } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class ApplyRolesTransactionRequest extends BaseTransactionRequest {
  @ApiProperty({
    description: "Array of roles to grant",
    example: '["0x2fa449e97717e92b32320917db3073c2407e0bc636bc1367e879e379239e26e5"]',
  })
  @IsArray()
  rolesToGrant: string[]

  @ApiProperty({
    description: "Array of roles to revoke",
    example: '["0x2fa449e97717e92b32320917db3073c2407e0bc636bc1367e879e379239e26e5"]',
  })
  @IsArray()
  rolesToRevoke: string[]

  constructor(format: string, accountId: string, rolesToGrant: string[] = [], rolesToRevoke: string[] = []) {
    super(format, accountId)
    this.rolesToGrant = rolesToGrant
    this.rolesToRevoke = rolesToRevoke
  }
}
