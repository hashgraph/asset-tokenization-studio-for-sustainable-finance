import {
  IsString,
  IsNotEmpty,
  IsHexadecimal,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionMetadata } from './TransactionMetadata';

export class SignedTransactionMessage {
  @IsString()
  @IsNotEmpty()
  @IsHexadecimal()
  payload: string;

  @ValidateNested()
  @Type(() => TransactionMetadata)
  @IsOptional()
  metadata?: TransactionMetadata;
}
