// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// solhint-disable max-line-length

import {Portfolio} from '../Portfolio.sol';
import {ProceedsManagement} from '../ProceedsManagement.sol';
import {LifeCycleCashFlow} from '../LifeCycleCashFlow.sol';

contract TreasuryTestWrapper is
    Portfolio,
    ProceedsManagement,
    LifeCycleCashFlow
{}
