// SPDX-License-Identifier: Apache-2.0

import { Column, Entity, JoinColumn, ManyToOne, Unique } from "typeorm"
import { EnvironmentalAssetPersistence } from "@port/persistence/environmentalasset/model/EnvironmentalAssetPersistence"
import { BaseEntityPersistence } from "@hashgraph/green-bonds-shared-core"

@Entity("EnvironmentalAssetToken")
@Unique(["environmentalAssetId", "tokenId"])
export class EnvironmentalAssetTokenPersistence extends BaseEntityPersistence {
  @Column()
  environmentalAssetId: string

  @ManyToOne(() => EnvironmentalAssetPersistence, { onDelete: "CASCADE" })
  @JoinColumn()
  environmentalAsset: EnvironmentalAssetPersistence

  @Column()
  tokenId: number
}
