import { Column, DeleteDateColumn, Entity, JoinColumn, ManyToOne } from "typeorm"
import { TreasuryPersistence } from "@port/persistence/treasury/model/TreasuryPersistence"
import { BaseEntityPersistence } from "@hashgraph/green-bonds-shared-core"

@Entity("EnvironmentalAsset")
export class EnvironmentalAssetPersistence extends BaseEntityPersistence {
  @Column()
  assetId: string

  @Column()
  treasuryId: string

  @ManyToOne(() => TreasuryPersistence, { onDelete: "CASCADE" })
  @JoinColumn()
  treasury: TreasuryPersistence

  @DeleteDateColumn()
  deletedAt?: Date
}
