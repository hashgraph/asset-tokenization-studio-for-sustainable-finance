import { BaseEntityPersistence } from "@hashgraph/green-bonds-shared-core"
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm"
import { PaymentTokenPersistence } from "@port/persistence/paymenttoken/model/PaymentTokenPersistence"
import { TransferType } from "@domain/shared/model/TransferType"

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

  @Column()
  type: TransferType
}
