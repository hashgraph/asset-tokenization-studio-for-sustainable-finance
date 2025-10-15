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

  async findById(id: string): Promise<PaymentTokenTransfer | null> {
    return await this.paymentTokenTransferRepository.findOne({ where: { id } })
  }

  async findByAccountId(accountId: string): Promise<PaymentTokenTransfer[]> {
    return await this.paymentTokenTransferRepository.find({ where: { accountId } })
  }
}
