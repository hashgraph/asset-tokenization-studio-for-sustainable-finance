// SPDX-License-Identifier: Apache-2.0

/**
 * Registry lookup utilities for facet definitions.
 * Queries treasuryRegistry and atsRegistry with fallback logic.
 */

import { atsRegistry } from "@hashgraph/asset-tokenization-contracts/scripts";
import { treasuryRegistry } from "@scripts/domain";

/**
 * Get facet definition from registry with automatic fallback.
 * Checks treasuryRegistry first, then atsRegistry.
 *
 * @param facetName - Name of the facet to look up
 * @returns Object containing facetName and resolverKey value
 * @throws Error if facet not found in either registry
 */
export function getFacetDefinitionFromRegistry(facetName: string) {
  const treasuryFacet = treasuryRegistry.getFacetDefinition(facetName);
  if (treasuryFacet?.resolverKey?.value) {
    return {
      facetName,
      resolverKey: treasuryFacet.resolverKey.value,
    };
  }

  const atsFacet = atsRegistry.getFacetDefinition(facetName);
  if (atsFacet?.resolverKey?.value) {
    return {
      facetName,
      resolverKey: atsFacet.resolverKey.value,
    };
  }

  throw new Error(`Facet ${facetName} not found in Treasury or ATS registries`);
}
