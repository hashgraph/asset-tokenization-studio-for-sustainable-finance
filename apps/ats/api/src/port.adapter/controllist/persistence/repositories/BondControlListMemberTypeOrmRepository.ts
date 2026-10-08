// SPDX-License-Identifier: Apache-2.0
import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { BondControlListMember } from "@domain/controllist/model/BondControlListMember"
import { BondControlListMemberPersistence } from "../model/BondControlListMemberPersistence"
import { Page, PageOptions } from "@hashgraph/green-bonds-shared-core"
import type { BondControlListMemberRepository } from "@domain/controllist/repository/BondControlListMemberRepository"

@Injectable()
export class BondControlListMemberTypeOrmRepository implements BondControlListMemberRepository {
  constructor(
    @InjectRepository(BondControlListMemberPersistence)
    private readonly repository: Repository<BondControlListMemberPersistence>,
  ) {}

  async save(member: BondControlListMember): Promise<BondControlListMember> {
    return (await this.repository.save(member as BondControlListMemberPersistence)) as BondControlListMember
  }

  async findByContractIdAndHolderAccountId(
    bondContractId: string,
    holderAccountId: string,
  ): Promise<BondControlListMember | null> {
    return (await this.repository.findOne({
      where: { bondContractId, holderAccountId },
    })) as BondControlListMember | null
  }

  async findAllByContractId(bondContractId: string, options: PageOptions): Promise<Page<BondControlListMember>> {
    const orderDirection = options.order.order.toUpperCase() as "ASC" | "DESC"
    const [persistences, total] = await this.repository.findAndCount({
      where: { bondContractId },
      order: { [options.order.orderBy]: orderDirection },
      take: options.limit,
      skip: (options.page - 1) * options.limit,
    })

    const items = persistences.map((p) => p as BondControlListMember)

    return {
      items,
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit),
    }
  }

  async delete(member: BondControlListMember): Promise<void> {
    await this.repository.delete({ bondContractId: member.bondContractId, holderAccountId: member.holderAccountId })
  }
}
