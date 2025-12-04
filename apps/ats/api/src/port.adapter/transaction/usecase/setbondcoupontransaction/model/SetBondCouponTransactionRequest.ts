// SPDX-License-Identifier: Apache-2.0
import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { Type } from "class-transformer"
import { IsDate, IsNotEmpty, IsNumberString } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class SetBondCouponTransactionRequest extends BaseTransactionRequest {
  @ApiProperty({
    description: "Record date for the coupon",
    example: "2024-12-31T00:00:00.000Z",
  })
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  recordDate: Date

  @ApiProperty({
    description: "Execution date for the coupon payment",
    example: "2025-01-15T00:00:00.000Z",
  })
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  executionDate: Date

  @ApiProperty({
    description: "Coupon rate",
    example: "500",
  })
  @IsNumberString()
  @IsNotEmpty()
  rate: string

  @ApiProperty({
    description: "Rate decimals",
    example: "2",
  })
  @IsNumberString()
  @IsNotEmpty()
  rateDecimals: string

  @ApiProperty({
    description: "Coupon period in seconds",
    example: "31536000",
  })
  @IsNumberString()
  @IsNotEmpty()
  period: string
}
