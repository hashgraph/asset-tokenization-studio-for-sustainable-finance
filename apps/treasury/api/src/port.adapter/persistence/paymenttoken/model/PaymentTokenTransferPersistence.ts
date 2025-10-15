import { BaseEntityPersistence } from "@hashgraph/green-bonds-shared-core"
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm"
import { TransferType } from "@domain/paymenttoken/model/TransferType"
import { PaymentTokenPersistence } from "@port/persistence/paymenttoken/model/PaymentTokenPersistence"

@Entity("PaymentTokenTransfer")
export class PaymentTokenTransferPersistence extends BaseEntityPersistence {
  @Column()
  accountId: string

  @Column()
  amount: string

  @Column()
  paymentTokenId: string

  @ManyToOne(() => PaymentTokenPersistence, { onDelete: "CASCADE" })
  @JoinColumn()
  paymentToken: PaymentTokenPersistence

  @Column({
    type: "enum",
    enum: TransferType,
  })
  type: TransferType
}
