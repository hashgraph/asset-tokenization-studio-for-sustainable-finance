import {
  IsString,
  IsNotEmpty,
  IsObject,
  ValidateNested,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export class TransactionMetadata {
  @IsString()
  @IsNotEmpty()
  origin: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  requestId: string;

  [key: string]: any;
}

export class SignedTransactionMessage {
  @IsString()
  @IsNotEmpty()
  payload: string;

  @IsObject()
  @ValidateNested()
  @Type(() => TransactionMetadata)
  metadata: TransactionMetadata;
}

export class SignedTransactionWithFormat extends SignedTransactionMessage {
  @IsString()
  @IsIn(['hedera', 'ethereum'])
  format: 'hedera' | 'ethereum';
}
