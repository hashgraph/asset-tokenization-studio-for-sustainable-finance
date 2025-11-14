// SPDX-License-Identifier: Apache-2.0
import { Entity, Column, Index, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from "typeorm"
import { ClearingStatus } from "@domain/bond/clearinghold/model/ClearingHold"

@Entity("BondClearingHolds")
@Index(["bondContractId", "holderAccountId", "id"], { unique: true })
@Index(["bondContractId", "holderAccountId"])
export class BondClearingHoldPersistence {
  @PrimaryColumn()
  id: number

  @PrimaryColumn({ type: "varchar", length: 255 })
  bondContractId: string

  @PrimaryColumn({ type: "varchar", length: 255 })
  holderAccountId: string

  @Column({ type: "varchar", length: 255 })
  partition: string

  @Column({ type: "varchar", length: 255 })
  amount: string

  @Column({ type: "timestamp" })
  expirationDate: Date

  @Column({ type: "enum", enum: ClearingStatus })
  status: ClearingStatus

  @Column({ type: "varchar", length: 255, nullable: true })
  holdId?: string

  @Column({ type: "varchar", length: 255, nullable: true })
  toAddress?: string

  @Column({ type: "varchar", length: 255, nullable: true })
  escrowAddress?: string

  @Column({ type: "text", nullable: true })
  data?: string

  @Column({ type: "text", nullable: true })
  operatorData?: string

  @Column({ type: "varchar", length: 255 })
  operator: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
