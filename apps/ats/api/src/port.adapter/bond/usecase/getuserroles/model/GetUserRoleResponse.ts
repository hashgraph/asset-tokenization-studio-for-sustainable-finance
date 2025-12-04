// SPDX-License-Identifier: Apache-2.0

import { ApiProperty, ApiSchema } from "@nestjs/swagger"

@ApiSchema({ name: "GetUserRole" })
export class GetUserRoleResponse {
  @ApiProperty({ description: "Role identifier", example: "ROLE_ADMIN" })
  roleId: string
}
