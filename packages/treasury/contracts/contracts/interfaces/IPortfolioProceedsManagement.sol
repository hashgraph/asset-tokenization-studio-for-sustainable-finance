// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.18;

import './IPortfolio.sol';
import './IProceedsManagement.sol';
import './ILifeCycleCashFlow.sol';

interface ITreasury is IPortfolio, IProceedsManagement, ILifeCycleCashFlow {}
