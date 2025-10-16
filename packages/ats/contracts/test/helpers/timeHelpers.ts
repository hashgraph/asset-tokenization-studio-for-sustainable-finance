// SPDX-License-Identifier: Apache-2.0

/**
 * TimeTravel test utilities for manipulating block.timestamp and block.number in tests.
 *
 * These helpers simplify time-based testing by providing convenient wrappers around
 * TimeTravelFacet functions.
 *
 * @module test/helpers/timeHelpers
 */

import type { ITimeTravel } from "@typechain";
import { BigNumber } from "ethers";

/**
 * Set the block timestamp to a specific value
 * @param timeTravel - TimeTravel facet instance
 * @param timestamp - Target timestamp (seconds since Unix epoch)
 */
export async function setBlockTimestamp(timeTravel: ITimeTravel, timestamp: number): Promise<void> {
  await timeTravel.changeSystemTimestamp(timestamp);
}

/**
 * Advance time by a specific number of seconds
 * @param timeTravel - TimeTravel facet instance
 * @param seconds - Number of seconds to advance
 */
export async function advanceTime(timeTravel: ITimeTravel, seconds: number): Promise<void> {
  const current: BigNumber = await timeTravel.blockTimestamp();
  await timeTravel.changeSystemTimestamp(current.add(seconds).toNumber());
}

/**
 * Advance time by days
 * @param timeTravel - TimeTravel facet instance
 * @param days - Number of days to advance
 */
export async function advanceTimeByDays(timeTravel: ITimeTravel, days: number): Promise<void> {
  const seconds = days * 24 * 60 * 60;
  await advanceTime(timeTravel, seconds);
}

/**
 * Reset timestamp to real block.timestamp
 * @param timeTravel - TimeTravel facet instance
 */
export async function resetTimestamp(timeTravel: ITimeTravel): Promise<void> {
  await timeTravel.resetSystemTimestamp();
}

/**
 * Set the block number to a specific value
 * @param timeTravel - TimeTravel facet instance
 * @param blockNumber - Target block number
 */
export async function setBlockNumber(timeTravel: ITimeTravel, blockNumber: number): Promise<void> {
  await timeTravel.changeSystemBlocknumber(blockNumber);
}

/**
 * Reset block number to real block.number
 * @param timeTravel - TimeTravel facet instance
 */
export async function resetBlockNumber(timeTravel: ITimeTravel): Promise<void> {
  await timeTravel.resetSystemBlocknumber();
}

/**
 * Get current mocked block timestamp
 * @param timeTravel - TimeTravel facet instance
 * @returns Current timestamp (mocked or real)
 */
export async function getCurrentTimestamp(timeTravel: ITimeTravel): Promise<BigNumber> {
  return await timeTravel.blockTimestamp();
}
