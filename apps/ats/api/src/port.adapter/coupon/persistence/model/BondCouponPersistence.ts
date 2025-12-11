// SPDX-License-Identifier: Apache-2.0
import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm"
import { BondPersistence } from "@port/bond/persistence/model/BondPersistence"

@Entity("BondCoupons")
export class BondCouponPersistence {
  @PrimaryColumn({ type: "varchar" })
  id: string

  @PrimaryColumn({ type: "varchar", length: 255 })
  bondContractId: string

  @ManyToOne(() => BondPersistence, { onDelete: "CASCADE" })
  @JoinColumn({ name: "bondContractId", referencedColumnName: "contractId" })
  bond: BondPersistence

  @Column({ type: "varchar", length: 255 })
  corporateActionId: string

  @Column({ type: "varchar", length: 255 })
  operator: string

  @Column({ type: "timestamp" })
  recordDate: Date

  @Column({ type: "timestamp" })
  executionDate: Date

  @Column({ type: "varchar" })
  rate: string

  @Column({ type: "varchar" })
  rateDecimals: string

  @Column({ type: "varchar" })
  period: string

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: Date
}
