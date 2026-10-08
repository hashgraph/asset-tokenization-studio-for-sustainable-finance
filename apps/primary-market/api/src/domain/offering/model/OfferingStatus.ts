// SPDX-License-Identifier: Apache-2.0

export enum OfferingStatus {
  PENDING = "PENDING",
  OPEN = "OPEN",
  CLOSED = "CLOSED",
  EXECUTABLE = "EXECUTABLE",
  CANCELLABLE_OR_EXECUTABLE = "CANCELLABLE_OR_EXECUTABLE",
  PROCESSED = "PROCESSED",
}

const numericToOfferingStatus: Record<number, OfferingStatus> = {
  0: OfferingStatus.PENDING,
  1: OfferingStatus.OPEN,
  2: OfferingStatus.CLOSED,
  3: OfferingStatus.EXECUTABLE,
  4: OfferingStatus.CANCELLABLE_OR_EXECUTABLE,
  5: OfferingStatus.PROCESSED,
}

export function numericStatusToOfferingStatus(numericStatus: number): OfferingStatus {
  const status = numericToOfferingStatus[numericStatus]
  if (!status) {
    throw new Error(`Unknown offering status: ${numericStatus}`)
  }
  return status
}
