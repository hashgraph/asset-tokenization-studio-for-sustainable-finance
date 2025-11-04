// SPDX-License-Identifier: Apache-2.0

import { Entity, Column, ManyToOne, JoinColumn, Unique } from "typeorm"
import { BaseEntityPersistence } from "@hashgraph/green-bonds-shared-core"
import { PrimaryMarketPersistence } from "@port/persistence/primarymarket/model/PrimaryMarketPersistence"

@Entity("Offering")
@Unique(["offeringId", "market"])
export class OfferingPersistence extends BaseEntityPersistence {
  @Column({ type: "varchar" })
  offeringId: string

  @ManyToOne(() => PrimaryMarketPersistence, (market) => market.offerings, { eager: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "marketId" })
  market: PrimaryMarketPersistence

  @Column()
  bondId: string

  @Column()
  operatorId: string

  @Column()
  treasuryId: string

  @Column()
  paymentTokenId: string

  @Column({ type: "varchar" })
  lotSize: string

  @Column({ type: "varchar" })
  minQuantity: string

  @Column({ type: "varchar" })
  maxQuantity: string

  @Column({ type: "varchar" })
  targetQuantity: string

  @Column({ type: "int" })
  targetQuantityRule: number

  @Column({ type: "timestamp" })
  startDate: Date

  @Column({ type: "timestamp" })
  endDate: Date

  @Column({ type: "int" })
  deadlineRule: number
}
