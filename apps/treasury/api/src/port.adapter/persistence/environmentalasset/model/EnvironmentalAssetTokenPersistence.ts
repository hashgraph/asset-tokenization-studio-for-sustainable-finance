// SPDX-License-Identifier: Apache-2.0

import { Column, Entity, JoinColumn, ManyToOne, Index } from "typeorm"
import { EnvironmentalAssetPersistence } from "@port/persistence/environmentalasset/model/EnvironmentalAssetPersistence"
import { BaseEntityPersistence } from "@hashgraph/green-bonds-shared-core"

@Entity("EnvironmentalAssetToken")
@Index(["environmentalAssetId", "serialNumber"], { unique: true })
export class EnvironmentalAssetTokenPersistence extends BaseEntityPersistence {
  @Column()
  environmentalAssetId: string

  @Column()
  serialNumber: string

  @ManyToOne(() => EnvironmentalAssetPersistence, { onDelete: "CASCADE" })
  @JoinColumn()
  environmentalAsset: EnvironmentalAssetPersistence
}
