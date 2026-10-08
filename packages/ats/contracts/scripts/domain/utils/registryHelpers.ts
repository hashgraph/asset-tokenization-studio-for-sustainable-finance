// SPDX-License-Identifier: Apache-2.0

/**
 * Registry lookup utilities for facet definitions.
 * Queries factorySuiteRegistry and atsRegistry with fallback logic.
 */

import { atsRegistry } from "@hashgraph/asset-tokenization-contracts/scripts";
import { factorySuiteRegistry } from "@scripts/domain";

/**
 * Get facet definition from registry with automatic fallback.
 * Checks factorySuiteRegistry first, then atsRegistry.
 */
export function getFacetDefinitionFromRegistry(facetName: string) {
  const factorySuiteFacet = factorySuiteRegistry.getFacetDefinition(facetName);
  if (factorySuiteFacet?.resolverKey?.value) {
    return {
      facetName,
      resolverKey: factorySuiteFacet.resolverKey.value,
    };
  }

  const atsFacet = atsRegistry.getFacetDefinition(facetName);
  if (atsFacet?.resolverKey?.value) {
    return {
      facetName,
      resolverKey: atsFacet.resolverKey.value,
    };
  }

  throw new Error(`Facet ${facetName} not found in FactorySuite or ATS registries`);
}
