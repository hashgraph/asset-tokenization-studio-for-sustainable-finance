// SPDX-License-Identifier: Apache-2.0
import { Page, PageOptions } from "@hashgraph/green-bonds-shared-core"
import { BondControlListMember } from "../model/BondControlListMember"

export interface BondControlListMemberRepository {
  save(member: BondControlListMember): Promise<BondControlListMember>
  findByContractIdAndHolderId(contractId: string, holderId: string): Promise<BondControlListMember | null>
  findAllByContractId(contractId: string, pageOptions: PageOptions): Promise<Page<BondControlListMember>>
  delete(member: BondControlListMember): Promise<void>
}
