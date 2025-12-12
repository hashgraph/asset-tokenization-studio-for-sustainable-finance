// SPDX-License-Identifier: Apache-2.0
import { BaseEntityPersistence } from "@hashgraph/green-bonds-shared-core"
import { Entity, Column, Index, ManyToOne, JoinColumn, PrimaryColumn } from "typeorm"
import { BondPersistence } from "@port/bond/persistence/model/BondPersistence"

@Entity("BondControlListMembers")
@Index(["bondContractId", "holderAccountId"], { unique: true })
export class BondControlListMemberPersistence extends BaseEntityPersistence {
  @PrimaryColumn({ type: "varchar", length: 255 })
  bondContractId: string

  @ManyToOne(() => BondPersistence, { onDelete: "CASCADE" })
  @JoinColumn({ name: "bondContractId", referencedColumnName: "contractId" })
  bond: BondPersistence

  @Column({ type: "varchar", length: 255 })
  holderAccountId: string
}
