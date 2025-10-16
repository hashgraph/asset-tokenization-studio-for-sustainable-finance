// SPDX-License-Identifier: Apache-2.0

/**
 * FactorySuite Registry Provider
 *
 * Clean dependency injection implementation for FactorySuite domain.
 * Provides a minimal registry with only the facets needed for FactorySuite:
 * - 2 ATS facets (AccessControlFacet, PauseFacet)
 * - 1 GBP custom facet (FactorySuiteFacet)
 *
 * This replaces the previous workaround of:
 * - Generating merged registry with 48 facets (47 ATS + 1 GBP)
 * - Runtime global registry mutation
 *
 * @module infrastructure/factorySuiteRegistry
 */

import type { RegistryProvider, FacetDefinition } from "@hashgraph/asset-tokenization-contracts/scripts";
import { FACET_REGISTRY as ATS_REGISTRY } from "@hashgraph/asset-tokenization-contracts/scripts";

/**
 * FactorySuite facet definitions.
 *
 * Includes:
 * - ATS facets: AccessControlFacet, PauseFacet
 * - GBP custom facets: FactorySuiteFacet
 */
const FACTORY_SUITE_FACETS: Record<string, FacetDefinition> = {
  // ATS facets (subset)
  AccessControlFacet: ATS_REGISTRY.AccessControlFacet,
  PauseFacet: ATS_REGISTRY.PauseFacet,

  // GBP custom facets
  FactorySuiteFacet: {
    name: "FactorySuiteFacet",
    description: "Atomic deployment of Bond + Treasury + KPI contracts",
  },
};

/**
 * FactorySuite Registry Provider.
 *
 * Implements RegistryProvider interface for clean dependency injection.
 * Use with ATS operations that accept optional registry parameter.
 *
 * @example
 * ```typescript
 * import { deployFacets } from '@hashgraph/asset-tokenization-contracts/scripts';
 * import { factorySuiteRegistry } from './infrastructure/factorySuiteRegistry';
 *
 * // Deploy with FactorySuite registry
 * const result = await deployFacets(provider, {
 *   facetNames: ['AccessControlFacet', 'PauseFacet', 'FactorySuiteFacet'],
 *   registry: factorySuiteRegistry  // ← Clean dependency injection!
 * });
 * ```
 */
export const factorySuiteRegistry: RegistryProvider = {
  getFacetDefinition(name: string): FacetDefinition | undefined {
    return FACTORY_SUITE_FACETS[name];
  },

  getAllFacets(): FacetDefinition[] {
    return Object.values(FACTORY_SUITE_FACETS);
  },
};
