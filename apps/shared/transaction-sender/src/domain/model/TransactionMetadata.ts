// SPDX-License-Identifier: Apache-2.0

import { IsString, IsNotEmpty } from 'class-validator';

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
}
