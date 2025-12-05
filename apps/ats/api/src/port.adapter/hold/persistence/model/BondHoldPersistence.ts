// SPDX-License-Identifier: Apache-2.0
import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from "typeorm"

@Entity("BondHolds")
export class BondHoldPersistence {
  @PrimaryColumn()
  id: number

  @PrimaryColumn({ type: "varchar" })
  contractId: string

  @PrimaryColumn({ type: "varchar", length: 255 })
  holderAccountId: string

  @PrimaryColumn({ type: "varchar", length: 255 })
  partition: string

  @Column({ type: "varchar" })
  amount: string

  @Column({ type: "timestamp" })
  expirationTimestamp: Date

  @Column({ type: "varchar", length: 255 })
  escrowAccountId: string

  @Column({ type: "varchar", length: 255 })
  toAccountId: string

  @Column({ type: "text", nullable: true })
  data: string

  @Column({ type: "text", nullable: true })
  operatorData: string

  @Column({ type: "varchar", length: 255 })
  operatorAccountId: string

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: Date
}
