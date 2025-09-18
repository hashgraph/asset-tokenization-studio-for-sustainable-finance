// SPDX-License-Identifier: Apache-2.0

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
  @IsOptional()
  @Type(() => TransactionMetadata)
  metadata?: TransactionMetadata;
}
