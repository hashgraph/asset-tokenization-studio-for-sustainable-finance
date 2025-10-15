// SPDX-License-Identifier: Apache-2.0

import { Column, Entity, JoinColumn, ManyToOne } from "typeorm"
import { BaseEntityPersistence } from "@hashgraph/green-bonds-shared-core"
import { EnvironmentalAssetPersistence } from "@port/persistence/environmentalasset/model/EnvironmentalAssetPersistence"
import { TransferType } from "@domain/shared/model/TransferType"

@Entity("EnvironmentalAssetTransfer")
export class EnvironmentalAssetTransferPersistence extends BaseEntityPersistence {
  @Column()
  accountId: string

  @Column()
  environmentalAssetId: string

  @ManyToOne(() => EnvironmentalAssetPersistence, { onDelete: "CASCADE" })
  @JoinColumn()
  environmentalAsset: EnvironmentalAssetPersistence

  @Column()
  tokenId: number

  @Column({
    type: "enum",
    enum: TransferType,
  })
  type: TransferType
}
