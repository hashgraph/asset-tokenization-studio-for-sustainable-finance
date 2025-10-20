// SPDX-License-Identifier: Apache-2.0

import { Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import { Repository } from "typeorm"
import { InjectRepository } from "@nestjs/typeorm"
import { PaymentTokenTransfer } from "@domain/paymenttoken/model/PaymentTokenTransfer"
import { PaymentTokenTransferPersistence } from "@port/persistence/paymenttoken/model/PaymentTokenTransferPersistence"
import { PaymentTokenTransferRepository } from "@domain/paymenttoken/repositories/PaymentTokenTransferRepository"

@Singleton()
export class PaymentTokenTransferTypeOrmRepository implements PaymentTokenTransferRepository {
  constructor(
    @InjectRepository(PaymentTokenTransferPersistence)
    private readonly paymentTokenTransferRepository: Repository<PaymentTokenTransferPersistence>,
  ) {}

  @Validate()
  async save(paymentTokenTransfer: PaymentTokenTransfer): Promise<PaymentTokenTransfer> {
    const persistence = await this.paymentTokenTransferRepository.save(
      paymentTokenTransfer as PaymentTokenTransferPersistence,
    )
    return persistence as PaymentTokenTransfer
  }

  async findByPaymentTokenId(
    paymentTokenId: string,
    options: PageOptions,
    type?: string,
  ): Promise<Page<PaymentTokenTransfer>> {
    const orderDirection = options.order.order.toUpperCase() as "ASC" | "DESC"

    const where: any = { paymentTokenId }
    if (type) {
      where.type = type
    }

    const [persistenceList, total] = await this.paymentTokenTransferRepository.findAndCount({
      where,
      order: { [options.order.orderBy]: orderDirection },
      skip: (options.page - 1) * options.limit,
      take: options.limit,
    })

    const items = persistenceList.map((persistence) => this.toDomain(persistence))

    return {
      items,
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit),
    }
  }

  private toDomain(persistence: PaymentTokenTransferPersistence): PaymentTokenTransfer {
    return { ...persistence } as PaymentTokenTransfer
  }
}
