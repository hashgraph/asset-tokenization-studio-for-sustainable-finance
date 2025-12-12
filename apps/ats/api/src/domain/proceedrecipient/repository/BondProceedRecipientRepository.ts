// SPDX-License-Identifier: Apache-2.0
import { BondProceedRecipient } from "../model/BondProceedRecipient"
import { Page, PageOptions } from "@hashgraph/green-bonds-shared-core"

export interface BondProceedRecipientRepository {
  save(recipient: BondProceedRecipient): Promise<BondProceedRecipient>
  findByContractIdAndProceedRecipientAddress(
    bondContractId: string,
    proceedRecipientAddress: string,
  ): Promise<BondProceedRecipient | null>
  findByContractId(bondContractId: string, options: PageOptions): Promise<Page<BondProceedRecipient>>
  delete(recipient: BondProceedRecipient): Promise<void>
}
