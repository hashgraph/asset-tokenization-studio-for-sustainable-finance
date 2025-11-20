// SPDX-License-Identifier: Apache-2.0

import { OfferingStatus } from "@domain/offering/model/OfferingStatus"
import { ApiProperty, ApiSchema } from "@nestjs/swagger"

@ApiSchema({ name: "PrimaryMarketBondOffering" })
export class PrimaryMarketBondOfferingResponse {
  @ApiProperty({ description: "Offering ID", example: 1 })
  id: number

  @ApiProperty({ description: "Bond contract ID", example: "0.0.7295385" })
  bondContractId: string

  @ApiProperty({ description: "Operator account ID", example: "0.0.1234" })
  operatorAccountId: string

  @ApiProperty({ description: "Treasury contract ID", example: "0.0.5678" })
  treasuryContractId: string

  @ApiProperty({ description: "Payment token contract ID", example: "0.0.9999" })
  paymentTokenContractId: string

  @ApiProperty({ description: "Size of each lot", example: "100" })
  lotSize: string

  @ApiProperty({ description: "Minimum number of lots per subscription", example: "10" })
  minLots: string

  @ApiProperty({ description: "Maximum number of lots per subscription", example: "100" })
  maxLots: string

  @ApiProperty({ description: "Target number of lots for the offering", example: "50" })
  targetLots: string

  @ApiProperty({ description: "Rule for target quantity (0: EXACT, 1: AT_LEAST)", example: 1 })
  targetQuantityRule: number

  @ApiProperty({ description: "Offering start date", example: "2025-11-01T00:00:00.000Z" })
  startDate: Date

  @ApiProperty({ description: "Offering end date", example: "2025-12-31T23:59:59.999Z" })
  endDate: Date

  @ApiProperty({ description: "Deadline rule (0: WAIT_UNTIL_END, 1: CLOSE_TARGET_REACHED)", example: 1 })
  deadlineRule: number

  @ApiProperty({ description: "Price per lot", example: "1000000" })
  price: string

  @ApiProperty({ description: "Offering status", enum: OfferingStatus, example: OfferingStatus.OPEN })
  status: OfferingStatus

  @ApiProperty({ description: "Creation date", example: "2025-11-18T10:26:35.769Z" })
  createdAt: Date
}
