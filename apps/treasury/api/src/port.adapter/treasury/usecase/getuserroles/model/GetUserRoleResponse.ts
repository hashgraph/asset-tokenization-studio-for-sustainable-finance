// SPDX-License-Identifier: Apache-2.0

import { ApiProperty, ApiSchema } from "@nestjs/swagger"

@ApiSchema({ name: "Role" })
export class GetUserRoleResponse {
  @ApiProperty({
    description: "Role id in hexadecimal",
    example: "0x2fa449e97717e92b32320917db3073c2407e0bc636bc1367e879e379239e26e5",
  })
  roleId: string
}
