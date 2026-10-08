// SPDX-License-Identifier: Apache-2.0

import { BaseEntityPersistence } from "@hashgraph/green-bonds-shared-core"
import { Column, Entity, ManyToOne, JoinColumn } from "typeorm"
import { ProceedsRecipientPersistence } from "./ProceedsRecipientPersistence"
import { PaymentTokenPersistence } from "@port/persistence/paymenttoken/model/PaymentTokenPersistence"

@Entity("ProceedsRecipientAllocation")
export class ProceedsRecipientAllocationPersistence extends BaseEntityPersistence {
  @Column()
  proceedsRecipientId: string

  @Column()
  paymentTokenId: string

  @Column()
  amount: string

  @ManyToOne(() => ProceedsRecipientPersistence, { onDelete: "CASCADE" })
  @JoinColumn()
  proceedsRecipient: ProceedsRecipientPersistence

  @ManyToOne(() => PaymentTokenPersistence, { onDelete: "CASCADE" })
  @JoinColumn()
  paymentToken: PaymentTokenPersistence
}
