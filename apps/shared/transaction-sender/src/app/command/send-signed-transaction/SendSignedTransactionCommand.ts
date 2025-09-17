import { TransactionMetadata } from '../../../domain/model/SignedTransactionMessage';

export class SendSignedTransactionCommand {
  constructor(
    public readonly payload: string,
    public readonly metadata: TransactionMetadata,
    public readonly format: 'hedera' | 'ethereum',
  ) {}
}
