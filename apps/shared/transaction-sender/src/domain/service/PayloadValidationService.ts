import { Injectable } from '@nestjs/common';
import { PayloadFormatError } from '../error/TransactionSenderError';

@Injectable()
export class PayloadValidationService {
  /**
   * Validates Hedera payload format
   * Ensures the payload can be deserialized using Transaction.fromBytes(...)
   */
  validateHederaPayload(payload: string): void {
    try {
      if (!this.isValidHexString(payload)) {
        throw new PayloadFormatError(
          'hedera',
          'Payload must be a valid hex string',
        );
      }
      const bytes = this.hexToUint8Array(payload);

      if (bytes.length === 0) {
        throw new PayloadFormatError('hedera', 'Payload cannot be empty');
      }
    } catch (error) {
      if (error instanceof PayloadFormatError) {
        throw error;
      }
      throw new PayloadFormatError(
        'hedera',
        'Invalid payload format',
        error instanceof Error ? error : undefined,
      );
    }
  }

  /**
   * Validates Ethereum payload format
   * Ensures the payload is a valid hex string matching /^0x[0-9a-fA-F]+$/
   */
  validateEthereumPayload(payload: string): void {
    const ethereumHexPattern = /^0x[0-9a-fA-F]+$/;

    if (!ethereumHexPattern.test(payload)) {
      throw new PayloadFormatError(
        'ethereum',
        'Payload must be a valid hex string starting with 0x',
      );
    }

    if (payload.length <= 2) {
      throw new PayloadFormatError('ethereum', 'Payload cannot be empty');
    }
  }

  private isValidHexString(str: string): boolean {
    const cleanStr = str.startsWith('0x') ? str.slice(2) : str;
    return /^[0-9a-fA-F]*$/.test(cleanStr) && cleanStr.length > 0;
  }

  private hexToUint8Array(hex: string): Uint8Array {
    const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;

    const paddedHex = cleanHex.length % 2 === 0 ? cleanHex : '0' + cleanHex;

    const bytes = new Uint8Array(paddedHex.length / 2);
    for (let i = 0; i < paddedHex.length; i += 2) {
      bytes[i / 2] = parseInt(paddedHex.substr(i, 2), 16);
    }

    return bytes;
  }
}
