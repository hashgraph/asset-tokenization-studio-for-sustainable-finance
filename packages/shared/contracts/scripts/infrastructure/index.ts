/**
 * Infrastructure utilities for Green Bonds Platform deployment.
 *
 * This module combines:
 * - Battle-tested ATS infrastructure utilities (re-exported)
 * - GBP-specific configuration helpers
 *
 * Most utilities are imported directly from @hashgraph/asset-tokenization-contracts
 * to avoid duplication and leverage proven implementations.
 */

// Re-export all ATS infrastructure utilities
export * from "@hashgraph/asset-tokenization-contracts/scripts/infrastructure";

// Export GBP-specific configuration
export * from "./config";
