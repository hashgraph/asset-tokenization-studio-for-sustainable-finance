// SPDX-License-Identifier: Apache-2.0

import { Entity, Column, OneToMany } from "typeorm"
import { BaseEntityPersistence } from "@hashgraph/green-bonds-shared-core"
import { SubscriptionPersistence } from "@port/persistence/subscription/model/SubscriptionPersistence"

@Entity("Investor")
export class InvestorPersistence extends BaseEntityPersistence {
  @Column({ unique: true })
  accountId: string

  @OneToMany(() => SubscriptionPersistence, (subscription) => subscription.investor, { cascade: true })
  subscriptions: SubscriptionPersistence[]
}
