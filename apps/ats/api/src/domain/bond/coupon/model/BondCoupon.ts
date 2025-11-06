// SPDX-License-Identifier: Apache-2.0
import { BaseEntity } from "@hashgraph/green-bonds-shared-core"

export class BondCoupon extends BaseEntity {
  contractId: string
  corporateActionId: string
  couponId: string
  operator: string
  recordDate: string
  executionDate: string
  rate: string
}
