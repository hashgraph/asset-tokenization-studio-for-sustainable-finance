// SPDX-License-Identifier: Apache-2.0

import type { ITimeTravel } from "@hashgraph/asset-tokenization-contracts";

export async function setBlockTimestamp(timeTravel: ITimeTravel, timestamp: number): Promise<void> {
  await timeTravel.changeSystemTimestamp(timestamp);
}

export async function advanceTime(timeTravel: ITimeTravel, seconds: number): Promise<void> {
  const current: bigint = await timeTravel.blockTimestamp();
  await timeTravel.changeSystemTimestamp(Number(current) + seconds);
}

export async function advanceTimeByDays(timeTravel: ITimeTravel, days: number): Promise<void> {
  const seconds = days * 24 * 60 * 60;
  await advanceTime(timeTravel, seconds);
}

export async function resetTimestamp(timeTravel: ITimeTravel): Promise<void> {
  await timeTravel.resetSystemTimestamp();
}

export async function setBlockNumber(timeTravel: ITimeTravel, blockNumber: number): Promise<void> {
  await timeTravel.changeSystemBlocknumber(blockNumber);
}

export async function resetBlockNumber(timeTravel: ITimeTravel): Promise<void> {
  await timeTravel.resetSystemBlocknumber();
}

export async function getCurrentTimestamp(timeTravel: ITimeTravel): Promise<bigint> {
  return await timeTravel.blockTimestamp();
}
