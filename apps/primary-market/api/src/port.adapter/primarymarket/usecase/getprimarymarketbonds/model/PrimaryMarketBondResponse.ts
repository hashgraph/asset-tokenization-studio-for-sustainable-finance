// SPDX-License-Identifier: Apache-2.0

import { ApiProperty, ApiSchema } from "@nestjs/swagger"

@ApiSchema({ name: "PrimaryMarketBond" })
export class PrimaryMarketBondResponse {
  @ApiProperty({ description: "Bond contract ID", example: "0.0.7295385" })
  bondContractId: string
}
