// SPDX-License-Identifier: Apache-2.0

import { ApiProperty, ApiSchema } from "@nestjs/swagger"

@ApiSchema({ name: "RoleMember" })
export class RoleMemberResponse {
  @ApiProperty({ description: "Hedera account ID of the user", example: "0.0.2378" })
  userAccountId: string
}
