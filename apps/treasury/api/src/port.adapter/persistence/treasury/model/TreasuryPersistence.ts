import { BaseEntityPersistence } from "@hashgraph/green-bonds-shared-core"
import { Column, Entity } from "typeorm"

@Entity("Treasury")
export class TreasuryPersistence extends BaseEntityPersistence {
  @Column()
  contractAddress: string

  @Column()
  bondContractAddress: string

  @Column()
  balance: string
}
