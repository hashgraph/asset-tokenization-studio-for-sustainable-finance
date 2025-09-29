// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    ArraysUpgradeable
} from '@openzeppelin/contracts-upgradeable/utils/ArraysUpgradeable.sol';
import {
    AccessControl
} from '@hashgraph/asset-tokenization-contracts/contracts/layer_1/accessControl/AccessControl.sol';
import {
    Pause
} from '@hashgraph/asset-tokenization-contracts/contracts/layer_1/pause/Pause.sol';
import {KPI_DATA_MANAGER_ROLE} from './constants/roles.sol';
import {MAIN_STORAGE_LOCATION} from './constants/storageLocation.sol';
import {IKpi} from './interfaces/IKpi.sol';

import {
    IResolverProxy
} from '@hashgraph/asset-tokenization-contracts/contracts/interfaces/resolver/resolverProxy/IResolverProxy.sol';
import {
    Initializable
} from '@openzeppelin/contracts/proxy/utils/Initializable.sol';

contract Kpi is IKpi, AccessControl, Pause, Initializable {
    using ArraysUpgradeable for uint256[];

    modifier validDate(uint256 _date) {
        if (_date == 0) revert InvalidDate(_date);
        _;
    }

    constructor() {
        _disableInitializers();
    }

    function addKpiData(
        uint256 _date,
        uint256 _kpiValue
    )
        external
        override
        validDate(_date)
        onlyUnpaused
        onlyRole(KPI_DATA_MANAGER_ROLE)
    {
        if (_date >= block.timestamp) revert InvalidDate(_date);
        KpiStorage storage kpiStorage = _getKpiStorage();

        kpiStorage.kpiData[_date].value += _kpiValue;
        kpiStorage.kpiData[_date].exists = true;

        emit KpiDataAdded(_date, _kpiValue);
    }

    function getKpiData(
        uint256 _fromDate,
        uint256 _toDate
    )
        external
        view
        override
        validDate(_fromDate)
        validDate(_toDate)
        returns (uint256 kpiAggregatedValue_, bool exists_)
    {
        if (_fromDate > _toDate) revert InvalidDateRange(_fromDate, _toDate);

        KpiStorage storage kpiStorage = _getKpiStorage();

        for (uint256 date = _fromDate; date <= _toDate; ) {
            if (kpiStorage.kpiData[date].exists) {
                kpiAggregatedValue_ += kpiStorage.kpiData[date].value;
                if (!exists_) {
                    exists_ = true;
                }
            }
            unchecked {
                date = date + 1 seconds;
            }
        }
        return (kpiAggregatedValue_, exists_);
    }

    function initialize(
        IResolverProxy.Rbac[] memory _rbacs
    ) public onlyUninitialized(_getKpiStorage().initialized) {
        KpiStorage storage kpiStorage = _getKpiStorage();
        kpiStorage.initialized = true;
        for (uint256 rbacIndex; rbacIndex < _rbacs.length; rbacIndex++) {
            for (
                uint256 memberIndex;
                memberIndex < _rbacs[rbacIndex].members.length;
                memberIndex++
            ) {
                _grantRole(
                    _rbacs[rbacIndex].role,
                    _rbacs[rbacIndex].members[memberIndex]
                );
            }
        }
    }

    function _getKpiStorage()
        private
        pure
        returns (KpiStorage storage kpiStorage)
    {
        assembly {
            kpiStorage.slot := MAIN_STORAGE_LOCATION
        }
    }
}
