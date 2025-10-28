// SPDX-License-Identifier: Apache-2.0

import { Entity, Column, ManyToOne, JoinColumn } from "typeorm"
import { BaseEntityPersistence } from "@hashgraph/green-bonds-shared-core"
import { OfferingPersistence } from "@port/persistence/offering/model/OfferingPersistence"
import { InvestorPersistence } from "@port/persistence/investor/model/InvestorPersistence"
import { SubscriptionStatus } from "@domain/shared/model/SubscriptionStatus"

@Entity("Subscription")
export class SubscriptionPersistence extends BaseEntityPersistence {
  @Column({ type: "varchar", unique: true })
  subscriptionId: string

  @ManyToOne(() => OfferingPersistence, { eager: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "offeringId" })
  offering: OfferingPersistence

  @ManyToOne(() => InvestorPersistence, (investor) => investor.subscriptions, { eager: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "investorId" })
  investor: InvestorPersistence

  @Column({ type: "varchar" })
  lotUnits: string

  @Column({ type: "enum", enum: SubscriptionStatus, default: SubscriptionStatus.SUBMITTED })
  status: SubscriptionStatus
}
