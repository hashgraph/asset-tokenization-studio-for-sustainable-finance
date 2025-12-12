// SPDX-License-Identifier: Apache-2.0
import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm"
import { BondPersistence } from "@port/bond/persistence/model/BondPersistence"

@Entity("BondLocks")
export class BondLockPersistence {
  @PrimaryColumn()
  id: number

  @PrimaryColumn({ type: "varchar" })
  bondContractId: string

  @ManyToOne(() => BondPersistence, { onDelete: "CASCADE" })
  @JoinColumn({ name: "bondContractId", referencedColumnName: "contractId" })
  bond: BondPersistence

  @Column({ type: "varchar", length: 255 })
  holderAccountId: string

  @Column({ type: "varchar", length: 255 })
  partition: string

  @Column({ type: "varchar" })
  amount: string

  @Column({ type: "timestamp" })
  expirationTimestamp: Date

  @Column({ type: "varchar", length: 255 })
  operatorAccountId: string

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: Date
}
