// SPDX-License-Identifier: Apache-2.0

import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from "typeorm"
import { PrimaryMarketPersistence } from "@port/persistence/primarymarket/model/PrimaryMarketPersistence"

@Entity("Offering")
export class OfferingPersistence {
  @PrimaryColumn()
  id: number

  @PrimaryColumn()
  marketId: string

  @ManyToOne(() => PrimaryMarketPersistence, (market) => market.offerings, { eager: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "marketId" })
  market: PrimaryMarketPersistence

  @Column()
  bondContractId: string

  @Column()
  operatorAccountId: string

  @Column()
  treasuryContractId: string

  @Column()
  paymentTokenContractId: string

  @Column({ type: "varchar" })
  lotSize: string

  @Column({ type: "varchar" })
  minLots: string

  @Column({ type: "varchar" })
  maxLots: string

  @Column({ type: "varchar" })
  targetLots: string

  @Column({ type: "int" })
  targetQuantityRule: number

  @Column({ type: "timestamp" })
  startDate: Date

  @Column({ type: "timestamp" })
  endDate: Date

  @Column({ type: "int" })
  deadlineRule: number

  @Column({ type: "varchar" })
  price: string

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: Date
}
