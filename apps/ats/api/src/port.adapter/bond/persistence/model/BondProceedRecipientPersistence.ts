// SPDX-License-Identifier: Apache-2.0
import { BaseEntityPersistence } from "@hashgraph/green-bonds-shared-core"
import { Entity, Column, Index } from "typeorm"

@Entity("BondProceedRecipients")
@Index(["contractId", "proceedRecipientAddress"], { unique: true })
export class BondProceedRecipientPersistence extends BaseEntityPersistence {
  @Column({ type: "varchar", length: 255 })
  contractId: string

  @Column({ type: "varchar", length: 255 })
  proceedRecipientAddress: string

  @Column({ type: "text", nullable: true })
  data?: string
}
