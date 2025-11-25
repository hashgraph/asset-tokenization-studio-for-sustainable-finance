// SPDX-License-Identifier: Apache-2.0

import { ApiProperty, ApiSchema } from "@nestjs/swagger"

@ApiSchema({ name: "Distribution" })
export class DistributionResponse {
  @ApiProperty({ description: "Distribution 1", example: 1 })
  id: number

  @ApiProperty({ description: "Creation date", example: "2025-11-18T10:26:35.769Z" })
  createdAt: Date
}
