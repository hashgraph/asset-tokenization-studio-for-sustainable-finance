// SPDX-License-Identifier: Apache-2.0
import { BaseEntityPersistence } from "@hashgraph/green-bonds-shared-core"
import { Entity, Column, Index } from "typeorm"
import { ClearingStatus } from "@domain/bond/clearinghold/model/ClearingHold"

@Entity("BondClearingHolds")
@Index(["bondContractId", "holderAccountId", "clearingId"], { unique: true })
@Index(["bondContractId", "holderAccountId"])
export class BondClearingHoldPersistence extends BaseEntityPersistence {
  @Column({ type: "varchar", length: 255 })
  bondContractId: string

  @Column({ type: "varchar", length: 255 })
  holderAccountId: string

  @Column({ type: "int" })
  clearingId: number

  @Column({ type: "varchar", length: 255 })
  partition: string

  @Column({ type: "varchar", length: 255 })
  amount: string

    @Column({ type: "timestamp" })
  expirationDate: Date

  @Column({ type: "enum", enum: ClearingStatus })
  status: ClearingStatus

  @Column({ type: "varchar", length: 255, nullable: true })
  toAddress?: string

  @Column({ type: "varchar", length: 255, nullable: true })
  escrowAddress?: string

  @Column({ type: "text", nullable: true })
  data?: string

  @Column({ type: "text", nullable: true })
  operatorData?: string

  @Column({ type: "varchar", length: 255 })
  operator: string
}
