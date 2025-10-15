// SPDX-License-Identifier: Apache-2.0

import { Column, Entity, JoinColumn, ManyToOne } from "typeorm"
import { EnvironmentalAssetTokenPersistence } from "@port/persistence/environmentalasset/model/EnvironmentalAssetTokenPersistence"
import { BaseEntityPersistence } from "@hashgraph/green-bonds-shared-core"
import { TransferType } from "@domain/environmentalasset/model/TransferType"

@Entity("EnvironmentalAssetTokenTransfer")
export class EnvironmentalAssetTokenTransferPersistence extends BaseEntityPersistence {
  @Column()
  environmentalAssetTokenId: string

  @Column()
  accountId: string

  @Column({
    type: "enum",
    enum: TransferType,
  })
  type: TransferType

  @ManyToOne(() => EnvironmentalAssetTokenPersistence, { onDelete: "CASCADE" })
  @JoinColumn()
  environmentalAssetToken: EnvironmentalAssetTokenPersistence
}
