// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.0;

import { ILifeCycleCashFlow } from "../../interfaces/ILifeCycleCashFlow.sol";
import { IPortfolio } from "../../interfaces/IPortfolio.sol";
import { IProceedsManagement } from "../../interfaces/IProceedsManagement.sol";
import { IPause } from "@hashgraph/asset-tokenization-contracts/contracts/layer_1/interfaces/pause/IPause.sol";
import {
    IAccessControl
} from "@hashgraph/asset-tokenization-contracts/contracts/layer_1/interfaces/accessControl/IAccessControl.sol";

interface ITreasury is ILifeCycleCashFlow, IPortfolio, IProceedsManagement, IAccessControl, IPause {
    error AlreadyInitialized();
}
