// SPDX-License-Identifier: Apache-2.0
import { BaseEntityPersistence } from "@hashgraph/green-bonds-shared-core"
import { Entity, Column, Index } from "typeorm"

@Entity("BondControlListMembers")
@Index(["contractId", "holderId"], { unique: true })
export class BondControlListMemberPersistence extends BaseEntityPersistence {
  @Column({ type: "varchar", length: 255 })
  contractId: string

  @Column({ type: "varchar", length: 255 })
  holderId: string
}
