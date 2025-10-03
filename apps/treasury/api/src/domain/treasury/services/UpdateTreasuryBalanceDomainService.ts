import { Inject, Singleton } from "@hashgraph/green-bonds-shared-core"
import type { TreasuryRepository } from "@domain/treasury/repositories/TreasuryRepository"
import { TreasuryNotFoundError } from "@domain/treasury/errors/TreasuryNotFoundError"
import { Treasury } from "@domain/treasury/model/Treasury"

@Singleton()
export class UpdateTreasuryBalanceDomainService {
  constructor(@Inject() private readonly treasuryRepository: TreasuryRepository) {}

  async execute(fromAddress: string, toAddress: string, amount: string): Promise<Treasury> {
    let amountToUpdateBalance = BigInt(amount)
    let treasury = await this.treasuryRepository.findByContractAddress(fromAddress)
    if (treasury) {
      amountToUpdateBalance = amountToUpdateBalance * -1n
    } else {
      treasury = await this.treasuryRepository.findByContractAddress(toAddress)
    }
    if (!treasury) {
      throw TreasuryNotFoundError.addressesError([fromAddress, toAddress])
    }
    treasury.balance = (BigInt(treasury.balance) + amountToUpdateBalance).toString()
    return await this.treasuryRepository.save(treasury)
  }
}
