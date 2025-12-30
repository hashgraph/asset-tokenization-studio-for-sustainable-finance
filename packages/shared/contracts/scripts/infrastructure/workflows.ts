// SPDX-License-Identifier: Apache-2.0

import { registerWorkflowDescriptor } from "@hashgraph/asset-tokenization-contracts/scripts";

/** GBP workflow descriptors registered with ATS deployment system. */

registerWorkflowDescriptor("gbpInfrastructure", "gbpInfra");
registerWorkflowDescriptor("gbpUpgrade", "gbpUpgrade");

export const GBP_WORKFLOWS_REGISTERED = true;
