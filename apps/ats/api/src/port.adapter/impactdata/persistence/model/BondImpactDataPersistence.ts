// SPDX-License-Identifier: Apache-2.0
import { BaseEntityPersistence } from "@hashgraph/green-bonds-shared-core"
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm"
import { BondPersistence } from "@port/bond/persistence/model/BondPersistence"

@Entity("BondImpactData")
export class BondImpactDataPersistence extends BaseEntityPersistence {
  @Column({ type: "varchar", length: 255, unique: true })
  bondContractId: string

  @ManyToOne(() => BondPersistence, { onDelete: "CASCADE" })
  @JoinColumn({ name: "bondContractId", referencedColumnName: "contractId" })
  bond: BondPersistence

  @Column({ type: "varchar", length: 255 })
  operator: string

  @Column({ type: "varchar" })
  maxDeviationCap: string

  @Column({ type: "varchar" })
  baseLine: string

  @Column({ type: "varchar" })
  maxDeviationFloor: string

  @Column({ type: "varchar" })
  impactDataDecimals: string

  @Column({ type: "varchar" })
  adjustmentPrecision: string
}
