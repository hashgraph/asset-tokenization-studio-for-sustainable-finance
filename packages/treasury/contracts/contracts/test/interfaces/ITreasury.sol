// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.0;

import { ILifeCycleCashFlow } from "../../interfaces/ILifeCycleCashFlow.sol";
import { IPortfolio } from "../../interfaces/IPortfolio.sol";
import { IPortfolioStorageWrapper } from "../../interfaces/IPortfolioStorageWrapper.sol";
import { IProceedsManagement } from "../../interfaces/IProceedsManagement.sol";
import { IProceedsManagementStorageWrapper } from "../../interfaces/IProceedsManagementStorageWrapper.sol";
import { IPause } from "@hashgraph/asset-tokenization-contracts/contracts/layer_1/interfaces/pause/IPause.sol";
import {
    IAccessControl
} from "@hashgraph/asset-tokenization-contracts/contracts/layer_1/interfaces/accessControl/IAccessControl.sol";

interface ITreasury is
    ILifeCycleCashFlow,
    IPortfolio,
    IPortfolioStorageWrapper,
    IProceedsManagement,
    IProceedsManagementStorageWrapper,
    IAccessControl,
    IPause
{
    error AlreadyInitialized();
}
