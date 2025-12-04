// SPDX-License-Identifier: Apache-2.0

import { ApiProperty, ApiSchema } from "@nestjs/swagger"

@ApiSchema({ name: "BondCoupons" })
export class BondCouponsResponse {
  @ApiProperty({
    description: "Array of coupon identifiers",
    example: ["COUP001", "COUP002", "COUP003"],
    type: [String]
  })
  couponIds: string[]
}
