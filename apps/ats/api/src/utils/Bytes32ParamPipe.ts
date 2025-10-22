import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ethers } from 'ethers';

@Injectable()
export class Bytes32ParamPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!ethers.utils.isHexString(value, 32)) {
      throw new BadRequestException(
        `Invalid bytes32 parameter: "${value}". Must be 0x + 64 hex chars.`,
      );
    }
    return value;
  }
}
