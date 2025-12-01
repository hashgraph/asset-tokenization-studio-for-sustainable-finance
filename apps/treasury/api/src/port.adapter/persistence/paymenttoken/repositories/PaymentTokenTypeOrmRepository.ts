// SPDX-License-Identifier: Apache-2.0

import { Singleton, Validate, Page, PageOptions, BaseRepository } from "@hashgraph/green-bonds-shared-core"
import { IsNull, Not } from "typeorm"
import { PaymentToken } from "@domain/paymenttoken/model/PaymentToken"
import { PaymentTokenPersistence } from "@port/persistence/paymenttoken/model/PaymentTokenPersistence"
import { PaymentTokenRepository } from "@domain/paymenttoken/repositories/PaymentTokenRepository"
import { plainToInstance } from "class-transformer"

@Singleton()
export class PaymentTokenTypeOrmRepository
  extends BaseRepository<PaymentTokenPersistence>
  implements PaymentTokenRepository
{
  constructor() {
    super(PaymentTokenPersistence)
  }

  @Validate()
  async save(paymentToken: PaymentToken, transactionId?: string): Promise<PaymentToken> {
    const persistence = await this.getRepository(transactionId).save(this.fromDomain(paymentToken))
    return this.toDomain(persistence)
  }

  async findById(id: string): Promise<PaymentToken | null> {
    const persistence = await this.getRepository().findOne({ where: { id } })
    return persistence ? this.toDomain(persistence) : null
  }

  async findByIds(ids: string[]): Promise<PaymentToken[]> {
    if (ids.length === 0) {
      return []
    }

    const persistences = await this.getRepository().findByIds(ids)
    return persistences.map((persistence) => this.toDomain(persistence))
  }

  async findAllByTreasuryId(treasuryId: string, options: PageOptions): Promise<Page<PaymentToken>> {
    const orderDirection = options.order.order.toUpperCase() as "ASC" | "DESC"

    const [persistences, total] = await this.getRepository().findAndCount({
      where: { treasuryId },
      order: { [options.order.orderBy]: orderDirection },
      take: options.limit,
      skip: (options.page - 1) * options.limit,
    })

    const items = persistences.map((persistence) => this.toDomain(persistence))

    return {
      items,
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit),
    }
  }

  async findByContractIdAndTreasuryId(contractId: string, treasuryId: string): Promise<PaymentToken | null> {
    const persistence = await this.findActivePersistence(contractId, treasuryId)
    return persistence ? this.toDomain(persistence) : null
  }

  private async findActivePersistence(contractId: string, treasuryId: string): Promise<PaymentTokenPersistence | null> {
    return this.getRepository().findOne({
      where: {
        contractId,
        treasuryId,
        removalDate: IsNull(),
      },
    })
  }

  async findByContractId(contractId: string): Promise<PaymentToken | null> {
    const persistence = await this.getRepository().findOne({
      where: {
        contractId: contractId,
        removalDate: IsNull(),
      },
    })
    return persistence ? this.toDomain(persistence) : null
  }

  async findByContractIdAndTreasuryContractId(
    contractId: string,
    treasuryContractId: string,
  ): Promise<PaymentToken | null> {
    const persistence = await this.getRepository().findOne({
      relations: {
        treasury: true,
      },
      where: {
        contractId,
        removalDate: IsNull(),
        treasury: {
          contractId: treasuryContractId,
        },
      },
    })
    return persistence ? this.toDomain(persistence) : null
  }

  async findAllRemovedByContractIdAndTreasuryContractId(
    contractId: string,
    treasuryContractId: string,
  ): Promise<PaymentToken[]> {
    const persistences = await this.getRepository().find({
      relations: {
        treasury: true,
      },
      where: {
        contractId,
        removalDate: Not(IsNull()),
        treasury: {
          contractId: treasuryContractId,
        },
      },
    })
    return persistences.map((persistence) => this.toDomain(persistence))
  }

  async existsByContractIdAndTreasuryContractId(
    contractId: string,
    treasuryContractId: string,
    removed?: boolean,
  ): Promise<boolean> {
    return await this.getRepository().exists({
      relations: {
        treasury: true,
      },
      where: {
        contractId,
        removalDate: removed ? Not(IsNull()) : IsNull(),
        treasury: {
          contractId: treasuryContractId,
        },
      },
    })
  }

  private toDomain(persistence: PaymentTokenPersistence): PaymentToken {
    return plainToInstance(PaymentToken, persistence)
  }

  private fromDomain(domainEntity: PaymentToken): PaymentTokenPersistence {
    return plainToInstance(PaymentTokenPersistence, domainEntity)
  }
}
