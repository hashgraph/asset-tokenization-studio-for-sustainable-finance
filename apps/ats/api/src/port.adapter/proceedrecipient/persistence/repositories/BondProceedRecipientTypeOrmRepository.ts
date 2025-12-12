// SPDX-License-Identifier: Apache-2.0
import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { BondProceedRecipient } from "@domain/proceedrecipient/model/BondProceedRecipient"
import { BondProceedRecipientPersistence } from "../model/BondProceedRecipientPersistence"
import { Page, PageOptions } from "@hashgraph/green-bonds-shared-core"
import { BondProceedRecipientRepository } from "@domain/proceedrecipient/repository/BondProceedRecipientRepository"

@Injectable()
export class BondProceedRecipientTypeOrmRepository implements BondProceedRecipientRepository {
  constructor(
    @InjectRepository(BondProceedRecipientPersistence)
    private readonly repository: Repository<BondProceedRecipientPersistence>,
  ) {}

  async save(recipient: BondProceedRecipient): Promise<BondProceedRecipient> {
    return (await this.repository.save(recipient as BondProceedRecipientPersistence)) as BondProceedRecipient
  }

  async findByContractIdAndProceedRecipientAddress(
    bondContractId: string,
    proceedRecipientAddress: string,
  ): Promise<BondProceedRecipient | null> {
    return (await this.repository.findOne({
      where: { bondContractId, proceedRecipientAddress },
    })) as BondProceedRecipient | null
  }

  async findByContractId(bondContractId: string, options: PageOptions): Promise<Page<BondProceedRecipient>> {
    const orderDirection = options.order.order.toUpperCase() as "ASC" | "DESC"
    const [persistences, total] = await this.repository.findAndCount({
      where: { bondContractId },
      order: { [options.order.orderBy]: orderDirection },
      take: options.limit,
      skip: (options.page - 1) * options.limit,
    })

    const items = persistences.map((p) => p as BondProceedRecipient)

    return {
      items,
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit),
    }
  }

  async delete(recipient: BondProceedRecipient): Promise<void> {
    await this.repository.delete({
      bondContractId: recipient.bondContractId,
      proceedRecipientAddress: recipient.proceedRecipientAddress,
    })
  }
}
