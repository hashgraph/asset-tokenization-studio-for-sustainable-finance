// SPDX-License-Identifier: Apache-2.0

import { SubscriptionStatus } from "@domain/shared/model/SubscriptionStatus"

export class SubscriptionQueryResponse {
  id: string
  createdAt: Date
  subscriptionId: string
  offeringId: string
  investorId: string
  lotUnits: string
  status: SubscriptionStatus
}
