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
    description: "Start date of the coupon period",
    example: "2024-01-01T00:00:00.000Z",
  })
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  startDate: Date

  @ApiProperty({
    description: "End date of the coupon period",
    example: "2024-12-31T00:00:00.000Z",
  })
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  endDate: Date

  @ApiProperty({
    description: "Fixing date for rate calculation",
    example: "2024-12-15T00:00:00.000Z",
  })
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  fixingDate: Date

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
    description: "Rate calculation status (0=PENDING, 1=SET)",
    example: "1",
    enum: [0, 1],
  })
  @IsNumberString()
  @IsNotEmpty()
  rateStatus: string
}
