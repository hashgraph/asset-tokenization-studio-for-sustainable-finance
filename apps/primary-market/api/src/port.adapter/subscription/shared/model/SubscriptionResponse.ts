// SPDX-License-Identifier: Apache-2.0

import { SubscriptionStatus } from "@domain/shared/model/SubscriptionStatus"
import { ApiProperty, ApiSchema } from "@nestjs/swagger"

@ApiSchema({ name: "Subscription" })
export class SubscriptionResponse {
  @ApiProperty({ description: "Subscription ID", example: 1 })
  id: number

  @ApiProperty({ description: "Offering ID this subscription belongs to", example: 1 })
  offeringId: number

  @ApiProperty({ description: "Investor account ID", example: "0.0.1234" })
  investorAccountId: string

  @ApiProperty({ description: "Number of lot units subscribed", example: "25" })
  lotUnits: string

  @ApiProperty({ description: "Subscription status", enum: SubscriptionStatus, example: SubscriptionStatus.SUBMITTED })
  status: SubscriptionStatus

  @ApiProperty({ description: "Creation date", example: "2025-11-18T10:26:35.769Z" })
  createdAt: Date
}
