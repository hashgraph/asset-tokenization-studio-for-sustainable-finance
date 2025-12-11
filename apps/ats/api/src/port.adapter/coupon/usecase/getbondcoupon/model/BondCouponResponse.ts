// SPDX-License-Identifier: Apache-2.0

import { ApiProperty, ApiSchema } from "@nestjs/swagger"

@ApiSchema({ name: "BondCoupon" })
export class BondCouponResponse {
  @ApiProperty({ description: "Coupon identifier", example: "1" })
  id: string

  @ApiProperty({ description: "Contract ID of the bond", example: "0.0.6823801" })
  bondContractId: string

  @ApiProperty({ description: "Corporate action ID associated with the coupon", example: "CA001" })
  corporateActionId: string

  @ApiProperty({ description: "Operator account EVM address", example: "0x000000000000000000000000000000000052BAC3" })
  operator: string

  @ApiProperty({ description: "Record date for the coupon", example: "2024-06-01T00:00:00.000Z" })
  recordDate: Date

  @ApiProperty({ description: "Execution date for the coupon payment", example: "2024-06-15T00:00:00.000Z" })
  executionDate: Date

  @ApiProperty({ description: "Coupon rate", example: "50000000000000000" })
  rate: string

  @ApiProperty({ description: "Number of decimals for the rate", example: "18" })
  rateDecimals: string

  @ApiProperty({ description: "Coupon period", example: "6" })
  period: string
}
