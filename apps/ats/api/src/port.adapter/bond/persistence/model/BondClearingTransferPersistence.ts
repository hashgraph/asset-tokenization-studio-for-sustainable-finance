// SPDX-License-Identifier: Apache-2.0
import { Entity, Column, Index, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from "typeorm"
import { ClearingStatus } from "@domain/bond/clearing/model/ClearingStatus"

@Entity("BondClearingTransfers")
@Index(["bondContractId", "holderAccountId", "id"], { unique: true })
@Index(["bondContractId", "holderAccountId"])
export class BondClearingTransferPersistence {
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

  @Column({ type: "varchar", length: 255 })
  toAccountId: string

  @Column({ type: "text", nullable: true })
  data?: string

  @Column({ type: "text", nullable: true })
  operatorData?: string

  @Column({ type: "varchar", length: 255 })
  operatorAccountId: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
