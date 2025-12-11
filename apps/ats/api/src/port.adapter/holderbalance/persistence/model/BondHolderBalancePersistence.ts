// SPDX-License-Identifier: Apache-2.0
import { Entity, Column, Index, ManyToOne, JoinColumn } from "typeorm"
import { BaseEntityPersistence } from "@hashgraph/green-bonds-shared-core"
import { BondPersistence } from "@port/bond/persistence/model/BondPersistence"

@Entity("BondHolderBalances")
@Index(["bondContractId", "holderAccountId", "partition"], { unique: true })
export class BondHolderBalancePersistence extends BaseEntityPersistence {
  @Column({ type: "varchar", length: 255 })
  bondContractId: string

  @ManyToOne(() => BondPersistence, { onDelete: "CASCADE" })
  @JoinColumn({ name: "bondContractId", referencedColumnName: "contractId" })
  bond: BondPersistence

  @Column({ type: "varchar", length: 255 })
  holderAccountId: string

  @Column({ type: "varchar", length: 255 })
  partition: string

  @Column({ type: "varchar" })
  availableBalance: string

  @Column({ type: "varchar", default: "0" })
  lockedBalance: string

  @Column({ type: "varchar", default: "0" })
  heldBalance: string

  @Column({ type: "varchar", default: "0" })
  clearingBalance: string
}
