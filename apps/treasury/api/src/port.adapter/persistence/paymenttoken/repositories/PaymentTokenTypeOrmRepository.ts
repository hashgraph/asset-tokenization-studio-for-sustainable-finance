// SPDX-License-Identifier: Apache-2.0

import { Singleton, Validate, Page, PageOptions } from "@hashgraph/green-bonds-shared-core"
import { Repository, IsNull } from "typeorm"
import { InjectRepository } from "@nestjs/typeorm"
import { PaymentToken } from "@domain/paymenttoken/model/PaymentToken"
import { PaymentTokenPersistence } from "@port/persistence/paymenttoken/model/PaymentTokenPersistence"
import { PaymentTokenRepository } from "@domain/paymenttoken/repositories/PaymentTokenRepository"

@Singleton()
export class PaymentTokenTypeOrmRepository implements PaymentTokenRepository {
  constructor(
    @InjectRepository(PaymentTokenPersistence)
    private readonly paymentTokenRepository: Repository<PaymentTokenPersistence>,
  ) {}

  @Validate()
  async save(paymentToken: PaymentToken): Promise<PaymentToken> {
    const persistence = await this.paymentTokenRepository.save(paymentToken as PaymentTokenPersistence)
    return persistence as PaymentToken
  }

  async findAllByTreasuryId(treasuryId: string, options: PageOptions): Promise<Page<PaymentToken>> {
    const orderDirection = options.order.order.toUpperCase() as "ASC" | "DESC"

    const [persistences, total] = await this.paymentTokenRepository.findAndCount({
      where: { treasuryId },
      order: { [options.order.orderBy]: orderDirection },
      take: options.limit,
      skip: (options.page - 1) * options.limit,
    })

    const items = persistences as PaymentToken[]

    return {
      items,
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit),
    }

  async findByContractIdAndTreasuryId(contractId: string, treasuryId: string): Promise<PaymentToken | null> {
    const persistence = await this.findActivePersistence(contractId, treasuryId)
    return persistence ? this.toDomain(persistence) : null
  }

  private async findActivePersistence(
    contractId: string,
    treasuryId: string,
  ): Promise<PaymentTokenPersistence | null> {
    return this.paymentTokenRepository.findOne({
      where: {
        contractId,
        treasuryId,
        removalDate: IsNull(),
      },
    })
  }

  async findByContractId(contractId: string): Promise<PaymentToken | null> {
    const persistence = await this.paymentTokenRepository.findOne({
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
    const persistence = await this.paymentTokenRepository.findOne({
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

  private toDomain(persistence: PaymentTokenPersistence): PaymentToken {
    return { ...persistence } as PaymentToken
  }
}
