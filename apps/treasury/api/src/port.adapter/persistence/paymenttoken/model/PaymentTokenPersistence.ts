import { BaseEntityPersistence } from "@hashgraph/green-bonds-shared-core"
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm"
import { TreasuryPersistence } from "@port/persistence/treasury/model/TreasuryPersistence"

@Entity("PaymentToken")
export class PaymentTokenPersistence extends BaseEntityPersistence {
  @Column()
  contractId: string

  @Column()
  treasuryId: string

  @ManyToOne(() => TreasuryPersistence, { onDelete: "CASCADE" })
  @JoinColumn()
  treasury: TreasuryPersistence

  @Column({ nullable: true })
  removalDate?: Date
}
