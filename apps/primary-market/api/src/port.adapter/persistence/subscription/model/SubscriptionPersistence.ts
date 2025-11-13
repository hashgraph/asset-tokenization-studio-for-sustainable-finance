// SPDX-License-Identifier: Apache-2.0

import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from "typeorm"
import { OfferingPersistence } from "@port/persistence/offering/model/OfferingPersistence"
import { SubscriptionStatus } from "@domain/shared/model/SubscriptionStatus"

@Entity("Subscription")
export class SubscriptionPersistence {
  @PrimaryColumn()
  id: number

  @PrimaryColumn()
  offeringId: number

  @PrimaryColumn({ type: "varchar" })
  marketId: string

  @ManyToOne(() => OfferingPersistence, { eager: true, onDelete: "CASCADE" })
  @JoinColumn([
    { name: "offeringId", referencedColumnName: "id" },
    { name: "marketId", referencedColumnName: "marketId" },
  ])
  offering: OfferingPersistence

  @Column()
  investorAccountId: string

  @Column({ type: "varchar" })
  lotUnits: string

  @Column({ type: "enum", enum: SubscriptionStatus, default: SubscriptionStatus.SUBMITTED })
  status: SubscriptionStatus

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: Date
}
