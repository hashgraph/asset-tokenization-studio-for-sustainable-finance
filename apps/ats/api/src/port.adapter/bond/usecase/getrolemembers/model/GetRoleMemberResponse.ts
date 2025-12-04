// SPDX-License-Identifier: Apache-2.0

import { ApiProperty, ApiSchema } from "@nestjs/swagger"

@ApiSchema({ name: "GetRoleMember" })
export class GetRoleMemberResponse {
  @ApiProperty({ description: "Account ID of the user with the role", example: "0.0.5421755" })
  userAccountId: string
}
