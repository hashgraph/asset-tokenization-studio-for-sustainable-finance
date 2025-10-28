// SPDX-License-Identifier: Apache-2.0

/**
 * Domain module exports for Green Bonds Platform Treasury.
 *
 * Provides Treasury-specific configuration and deployment logic.
 *
 * @module domain
 *
 * @example
 * ```typescript
 * // Import domain constants
 * import { TREASURY_CONFIG_ID } from '@scripts/domain'
 *
 * // Import configuration creation
 * import { createTreasuryConfiguration } from '@scripts/domain'
 * ```
 */

// Domain constants
export * from './constants'

// FactorySuite configuration
export * from './treasury/createConfiguration'
