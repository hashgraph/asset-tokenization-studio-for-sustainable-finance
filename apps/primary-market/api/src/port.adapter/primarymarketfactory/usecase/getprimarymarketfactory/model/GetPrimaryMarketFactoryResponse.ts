// SPDX-License-Identifier: Apache-2.0

import { ApiProperty, ApiSchema } from "@nestjs/swagger"

@ApiSchema({ name: "PrimaryMarketFactoryResponse" })
export class GetPrimaryMarketFactoryResponse {
  @ApiProperty({
    description: "The contract ID of the Primary Market Factory",
    example: "0.0.7362135",
  })
  factoryContractId: string

  @ApiProperty({
    description: "Indicates whether the Primary Market Factory is currently paused",
    example: false,
  })
  isPaused: boolean

  @ApiProperty({
    description: "The timestamp when the Primary Market Factory was created",
    example: "2024-12-03T10:30:00.000Z",
  })
  createdAt: Date
}
