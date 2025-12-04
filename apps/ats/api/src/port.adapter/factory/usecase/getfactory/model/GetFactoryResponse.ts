// SPDX-License-Identifier: Apache-2.0

import { ApiProperty, ApiSchema } from "@nestjs/swagger"

@ApiSchema({ name: "GetFactory" })
export class GetFactoryResponse {
  @ApiProperty({ description: "Contract ID of the factory", example: "0.0.5421755" })
  factoryContractId: string

  @ApiProperty({ description: "Indicates if the factory is paused", example: false })
  isPaused: boolean

  @ApiProperty({ description: "Creation timestamp of the factory", example: "2024-01-01T00:00:00.000Z" })
  createdAt: Date
}
