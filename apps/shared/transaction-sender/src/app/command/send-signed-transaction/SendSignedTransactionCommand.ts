import { TransactionMetadata } from '../../../domain/model/TransactionMetadata';

export class SendSignedTransactionCommand {
  constructor(
    public readonly payload: string,
    public readonly metadata: TransactionMetadata,
    public readonly format: string,
  ) {}
}
