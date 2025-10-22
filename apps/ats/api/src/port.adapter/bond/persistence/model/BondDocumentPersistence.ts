import { BaseEntityPersistence } from "@hashgraph/green-bonds-shared-core"
import {Entity, Column, Index} from "typeorm"

@Entity("BondDocument")
@Index(["name", "contractId"], { unique: true })
export class BondDocumentPersistence extends BaseEntityPersistence {
  @Column({ type: "varchar", length: 255 })
  name: string

  @Column({ type: "varchar", length: 255 })
  contractId: string

  @Column({ type: "varchar", length: 255 })
  uri: string

  @Column({ type: "varchar", length: 255 })
  hash: string
}
