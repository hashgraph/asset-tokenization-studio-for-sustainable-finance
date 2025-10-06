import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn } from "typeorm"
import { TreasuryPersistence } from "@port/persistence/treasury/model/TreasuryPersistence"

@Entity("EnvironmentalAsset")
export class EnvironmentalAssetPersistence {
  @PrimaryColumn({ type: "varchar" })
  id: string

  @Column()
  treasuryId: string

  @ManyToOne(() => TreasuryPersistence, { onDelete: "CASCADE" })
  @JoinColumn()
  treasury: TreasuryPersistence

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
