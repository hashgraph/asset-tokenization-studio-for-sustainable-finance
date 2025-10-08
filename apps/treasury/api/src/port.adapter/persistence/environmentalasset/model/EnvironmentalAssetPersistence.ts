import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm"
import { TreasuryPersistence } from "@port/persistence/treasury/model/TreasuryPersistence"

@Entity("EnvironmentalAsset")
export class EnvironmentalAssetPersistence {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  contractId: string

  @Column()
  treasuryId: string

  @ManyToOne(() => TreasuryPersistence, { onDelete: "CASCADE" })
  @JoinColumn()
  treasury: TreasuryPersistence

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @DeleteDateColumn()
  deletedAt?: Date
}
