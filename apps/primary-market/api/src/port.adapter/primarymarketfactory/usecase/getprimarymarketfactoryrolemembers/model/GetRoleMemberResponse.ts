// SPDX-License-Identifier: Apache-2.0

import { ApiProperty, ApiSchema } from "@nestjs/swagger"

@ApiSchema({ name: "RoleMember" })
export class GetRoleMemberResponse {
  @ApiProperty({ description: "Hedera account Id of the user", example: "0.0.2378" })
  userAccountId: string
}
