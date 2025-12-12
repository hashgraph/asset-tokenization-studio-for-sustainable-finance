// SPDX-License-Identifier: Apache-2.0
import { BaseEntityPersistence } from "@hashgraph/green-bonds-shared-core"
import { Entity, Column, Index, ManyToOne, JoinColumn } from "typeorm"
import { BondPersistence } from "@port/bond/persistence/model/BondPersistence"

@Entity("BondDocuments")
@Index(["name", "bondContractId"], { unique: true })
export class BondDocumentPersistence extends BaseEntityPersistence {
  @Column({ type: "varchar", length: 255 })
  name: string

  @Column({ type: "varchar", length: 255 })
  bondContractId: string

  @ManyToOne(() => BondPersistence, { onDelete: "CASCADE" })
  @JoinColumn({ name: "bondContractId", referencedColumnName: "contractId" })
  bond: BondPersistence

  @Column({ type: "varchar", length: 255 })
  uri: string

  @Column({ type: "varchar", length: 255 })
  hash: string
}
