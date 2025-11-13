// SPDX-License-Identifier: Apache-2.0

export enum OfferingStatus {
  PENDING = "PENDING",
  OPEN = "OPEN",
  CLOSED = "CLOSED",
  EXECUTABLE = "EXECUTABLE",
  CANCELLABLE = "CANCELLABLE",
  EXECUTED = "EXECUTED",
  CANCELLED = "CANCELLED",
}

const numericToOfferingStatus: Record<number, OfferingStatus> = {
  0: OfferingStatus.PENDING,
  1: OfferingStatus.OPEN,
  2: OfferingStatus.CLOSED,
  3: OfferingStatus.EXECUTABLE,
  4: OfferingStatus.CANCELLABLE,
  5: OfferingStatus.EXECUTED,
  6: OfferingStatus.CANCELLED,
}

export function numericStatusToOfferingStatus(numericStatus: number): OfferingStatus {
  const status = numericToOfferingStatus[numericStatus]
  if (!status) {
    throw new Error(`Unknown offering status: ${numericStatus}`)
  }
  return status
}
