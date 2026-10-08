// SPDX-License-Identifier: Apache-2.0
import { BaseEntityPersistence } from "@hashgraph/green-bonds-shared-core"
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm"
import { BondPersistence } from "@port/bond/persistence/model/BondPersistence"

@Entity("BondKpiData")
@Index("BondKpiData_bond_date_project_idx", ["bondContractId", "date", "project"], { unique: true })
export class BondKpiDataPersistence extends BaseEntityPersistence {
  @Column({ type: "varchar", length: 255 })
  bondContractId: string

  @ManyToOne(() => BondPersistence, { onDelete: "CASCADE" })
  @JoinColumn({ name: "bondContractId", referencedColumnName: "contractId" })
  bond: BondPersistence

  @Column({ type: "varchar", length: 255 })
  project: string

  @Column({ type: "varchar" })
  date: string

  @Column({ type: "varchar" })
  value: string
}
