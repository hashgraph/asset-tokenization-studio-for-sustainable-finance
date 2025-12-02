// SPDX-License-Identifier: Apache-2.0

import { PaymentToken } from "@domain/paymenttoken/model/PaymentToken"
import { Page, PageOptions } from "@hashgraph/green-bonds-shared-core"

export interface PaymentTokenRepository {
  save(paymentToken: PaymentToken, transactionId?: string): Promise<PaymentToken>

  findById(id: string): Promise<PaymentToken | null>

  findByIds(ids: string[]): Promise<PaymentToken[]>

  findAllByTreasuryId(treasuryId: string, options: PageOptions): Promise<Page<PaymentToken>>

  findByContractId(contractId: string): Promise<PaymentToken | null>

  findByContractIdAndTreasuryContractId(contractId: string, treasuryContractId: string): Promise<PaymentToken | null>

  findAllRemovedByContractIdAndTreasuryContractId(
    contractId: string,
    treasuryContractId: string,
  ): Promise<PaymentToken[]>

  existsByContractIdAndTreasuryContractId(
    contractId: string,
    treasuryContractId: string,
    removed?: boolean,
  ): Promise<boolean>
}
