// SPDX-License-Identifier: Apache-2.0

import { IsNotEmpty, IsString, IsIn, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionMetadata } from '../../../domain/model/TransactionMetadata';

export class SendSignedTransactionCommand {
  @IsNotEmpty()
  @IsString()
  payload: string;

  @ValidateNested()
  @Type(() => TransactionMetadata)
  metadata: TransactionMetadata;

  @IsIn(['hedera', 'ethereum'])
  format: string;

  constructor(payload: string, metadata: TransactionMetadata, format: string) {
    this.payload = payload;
    this.metadata = metadata;
    this.format = format;
  }
}
