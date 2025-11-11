// SPDX-License-Identifier: Apache-2.0

import { SubscriptionStatus } from "@domain/shared/model/SubscriptionStatus"

export class SubscriptionQueryResponse {
  subscriptionDltId: string
  offeringDltId: string
  investorAccountId: string
  lotUnits: string
  status: SubscriptionStatus
  createdAt: Date
}
