// SPDX-License-Identifier: Apache-2.0
import { BaseEntityPersistence } from "@hashgraph/green-bonds-shared-core"
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm"
import { BondPersistence } from "@port/bond/persistence/model/BondPersistence"

@Entity("BondInterestRates")
export class BondInterestRatePersistence extends BaseEntityPersistence {
  @Column({ type: "varchar", length: 255, unique: true })
  bondContractId: string

  @ManyToOne(() => BondPersistence, { onDelete: "CASCADE" })
  @JoinColumn({ name: "bondContractId", referencedColumnName: "contractId" })
  bond: BondPersistence

  @Column({ type: "varchar", length: 255 })
  operator: string

  @Column({ type: "varchar" })
  maxRate: string

  @Column({ type: "varchar" })
  baseRate: string

  @Column({ type: "varchar" })
  minRate: string

  @Column({ type: "varchar", default: "0" })
  startPeriod: string

  @Column({ type: "varchar" })
  startRate: string

  @Column({ type: "varchar" })
  missedPenalty: string

  @Column({ type: "varchar" })
  reportPeriod: string

  @Column({ type: "varchar" })
  rateDecimals: string
}
