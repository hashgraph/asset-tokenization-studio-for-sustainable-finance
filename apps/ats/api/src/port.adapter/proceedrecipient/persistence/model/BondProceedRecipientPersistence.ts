// SPDX-License-Identifier: Apache-2.0
import { BaseEntityPersistence } from "@hashgraph/green-bonds-shared-core"
import { Entity, Column, Index, ManyToOne, JoinColumn } from "typeorm"
import { BondPersistence } from "@port/bond/persistence/model/BondPersistence"

@Entity("BondProceedRecipients")
@Index(["bondContractId", "proceedRecipientAddress"], { unique: true })
export class BondProceedRecipientPersistence extends BaseEntityPersistence {
  @Column({ type: "varchar", length: 255 })
  bondContractId: string

  @ManyToOne(() => BondPersistence, { onDelete: "CASCADE" })
  @JoinColumn({ name: "bondContractId", referencedColumnName: "contractId" })
  bond: BondPersistence

  @Column({ type: "varchar", length: 255 })
  proceedRecipientAddress: string

  @Column({ type: "text", nullable: true })
  data?: string
}
