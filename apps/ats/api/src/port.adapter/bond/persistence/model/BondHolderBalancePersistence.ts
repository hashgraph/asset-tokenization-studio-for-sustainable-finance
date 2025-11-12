// SPDX-License-Identifier: Apache-2.0
import { Entity, Column, Index } from "typeorm"
import { BaseEntityPersistence } from "@hashgraph/green-bonds-shared-core"

@Entity("BondHolderBalances")
@Index(["contractId", "holderAccountId", "partition"], { unique: true })
export class BondHolderBalancePersistence extends BaseEntityPersistence {
  @Column({ type: "varchar", length: 255 })
  contractId: string

  @Column({ type: "varchar", length: 255 })
  holderAccountId: string

  @Column({ type: "varchar", length: 255 })
  partition: string

  @Column({ type: "varchar" })
  availableBalance: string

  @Column({ type: "varchar", default: "0" })
  lockedBalance: string
}
