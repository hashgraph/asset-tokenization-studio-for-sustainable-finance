// SPDX-License-Identifier: Apache-2.0
import { BondProceedRecipient } from "../model/BondProceedRecipient"
import { Page, PageOptions } from "@hashgraph/green-bonds-shared-core"

export interface BondProceedRecipientRepository {
  save(recipient: BondProceedRecipient): Promise<BondProceedRecipient>
  findByContractIdAndProceedRecipientAddress(
    contractId: string,
    proceedRecipientAddress: string,
  ): Promise<BondProceedRecipient | null>
  findByContractId(contractId: string, options: PageOptions): Promise<Page<BondProceedRecipient>>
  delete(recipient: BondProceedRecipient): Promise<void>
}
