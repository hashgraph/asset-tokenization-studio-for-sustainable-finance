// SPDX-License-Identifier: Apache-2.0

import { SubscriptionStatus } from "@domain/shared/model/SubscriptionStatus"

export class SubscriptionQueryResponse {
  id: number
  offeringId: number
  investorAccountId: string
  lotUnits: string
  status: SubscriptionStatus
  createdAt: Date
}
