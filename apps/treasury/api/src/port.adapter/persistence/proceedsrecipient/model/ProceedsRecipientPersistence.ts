// SPDX-License-Identifier: Apache-2.0

import { BaseEntityPersistence } from "@hashgraph/green-bonds-shared-core"
import { Column, Entity, ManyToOne, JoinColumn } from "typeorm"
import { TreasuryPersistence } from "@port/persistence/treasury/model/TreasuryPersistence"

@Entity("ProceedsRecipient")
export class ProceedsRecipientPersistence extends BaseEntityPersistence {
  @Column()
  contractId: string

  @Column()
  treasuryId: string

  @ManyToOne(() => TreasuryPersistence, { onDelete: "CASCADE" })
  @JoinColumn()
  treasury: TreasuryPersistence
}
