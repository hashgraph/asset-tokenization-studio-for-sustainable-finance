// SPDX-License-Identifier: Apache-2.0

import { Singleton, Validate } from "@hashgraph/green-bonds-shared-core"
import { Repository } from "typeorm"
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
}
