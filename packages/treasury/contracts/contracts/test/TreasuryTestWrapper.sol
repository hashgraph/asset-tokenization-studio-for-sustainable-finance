// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.18;

// solhint-disable max-line-length

import {Portfolio} from '../Portfolio.sol';
import {ProceedsManagement} from '../ProceedsManagement.sol';

contract TreasuryTestWrapper is Portfolio, ProceedsManagement {}
