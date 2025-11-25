// SPDX-License-Identifier: Apache-2.0
import { BaseTransactionRequest } from "@hashgraph/green-bonds-shared-core"
import { Type } from "class-transformer"
import { IsDate, IsNotEmpty, IsNumber, IsNumberString, IsString } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class CreateOfferingTransactionRequest extends BaseTransactionRequest {
  @ApiProperty({
    description: "The EVM address of the treasury contract",
    example: "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
  })
  @IsNotEmpty()
  @IsString()
  treasuryAddress: string

  @ApiProperty({
    description: "The EVM address of the payment token contract",
    example: "0x0000000000000000000000000000000000629238",
  })
  @IsNotEmpty()
  @IsString()
  paymentTokenAddress: string

  @ApiProperty({
    description: "The size of each lot in the offering",
    example: "1000",
  })
  @IsNotEmpty()
  @IsNumberString()
  lotSize: string

  @ApiProperty({
    description: "The minimum number of lots that can be subscribed",
    example: "1",
  })
  @IsNotEmpty()
  @IsNumberString()
  minLots: string

  @ApiProperty({
    description: "The maximum number of lots that can be subscribed per investor",
    example: "100",
  })
  @IsNotEmpty()
  @IsNumberString()
  maxLots: string

  @ApiProperty({
    description: "The target number of lots for the offering",
    example: "1000",
  })
  @IsNotEmpty()
  @IsNumberString()
  targetLots: string

  @ApiProperty({
    description: "The rule for target quantity (0: AT_LEAST, 1: AT_MOST, 2: BETWEEN)",
    example: 0,
  })
  @IsNotEmpty()
  @IsNumber()
  targetQuantityRule: number

  @ApiProperty({
    description: "The start date of the offering",
    example: "2025-01-01T00:00:00.000Z",
  })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  startDate: Date

  @ApiProperty({
    description: "The end date of the offering",
    example: "2025-12-31T23:59:59.000Z",
  })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  endDate: Date

  @ApiProperty({
    description: "The deadline rule for the offering (0: SOFT, 1: HARD)",
    example: 0,
  })
  @IsNotEmpty()
  @IsNumber()
  deadlineRule: number

  @ApiProperty({
    description: "The price per lot in the payment token",
    example: "100",
  })
  @IsNotEmpty()
  @IsNumberString()
  price: string
}
