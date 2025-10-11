import { BaseEntityPersistence } from "@hashgraph/green-bonds-shared-core"
import { Column, Entity, JoinColumn, OneToOne } from "typeorm"
import { PaymentTokenPersistence } from "@port/persistence/paymenttoken/model/PaymentTokenPersistence"

@Entity("Treasury")
export class TreasuryPersistence extends BaseEntityPersistence {
  @Column()
  contractId: string

  @Column()
  bondContractId: string

  @OneToOne(() => PaymentTokenPersistence, { eager: true, cascade: true })
  @JoinColumn()
  paymentToken: PaymentTokenPersistence

  @Column()
  paused: boolean = false
}
