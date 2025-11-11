// SPDX-License-Identifier: Apache-2.0

import { BaseEntityPersistence } from "@hashgraph/green-bonds-shared-core"
import { Column, Entity, ManyToOne, JoinColumn } from "typeorm"
import { TreasuryPersistence } from "@port/persistence/treasury/model/TreasuryPersistence"
import { PaymentTokenPersistence } from "@port/persistence/paymenttoken/model/PaymentTokenPersistence"

@Entity("RedemptionHolder")
export class RedemptionHolderPersistence extends BaseEntityPersistence {
  @Column()
  holderAccountId: string

  @Column()
  status: string

  @Column({ nullable: true })
  amount?: string

  @Column()
  treasuryId: string

  @ManyToOne(() => TreasuryPersistence, { onDelete: "CASCADE" })
  @JoinColumn()
  treasury: TreasuryPersistence

  @Column()
  paymentTokenId: string

  @ManyToOne(() => PaymentTokenPersistence, { onDelete: "CASCADE" })
  @JoinColumn()
  paymentToken: PaymentTokenPersistence
}
