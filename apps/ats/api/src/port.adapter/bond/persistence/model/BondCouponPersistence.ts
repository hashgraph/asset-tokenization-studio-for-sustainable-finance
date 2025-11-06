// SPDX-License-Identifier: Apache-2.0
import { BaseEntityPersistence } from "@hashgraph/green-bonds-shared-core"
import { Entity, Column } from "typeorm"

@Entity("BondCoupons")
export class BondCouponPersistence extends BaseEntityPersistence {
  @Column({ type: "varchar", length: 255 })
  contractId: string

  @Column({ type: "varchar", length: 255 })
  corporateActionId: string

  @Column({ type: "varchar" })
  couponId: string

  @Column({ type: "varchar", length: 255 })
  operator: string

  @Column({ type: "varchar" })
  recordDate: string

  @Column({ type: "varchar" })
  executionDate: string

  @Column({ type: "varchar" })
  rate: string
}
