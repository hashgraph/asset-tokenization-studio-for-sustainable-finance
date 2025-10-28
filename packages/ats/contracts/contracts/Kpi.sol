// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import { ArraysUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/ArraysUpgradeable.sol";
import { AccessControl } from "@hashgraph/asset-tokenization-contracts/contracts/layer_1/accessControl/AccessControl.sol";
import { Pause } from "@hashgraph/asset-tokenization-contracts/contracts/layer_1/pause/Pause.sol";
import { KPI_DATA_MANAGER_ROLE } from "./constants/roles.sol";
import { KPI_STORAGE_LOCATION } from "./constants/storageLocation.sol";
import { IKpi } from "./interfaces/IKpi.sol";

import { IResolverProxy } from "@hashgraph/asset-tokenization-contracts/contracts/interfaces/resolver/resolverProxy/IResolverProxy.sol";
import { Initializable } from "@openzeppelin/contracts/proxy/utils/Initializable.sol";

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
        uint256 date,
        uint256 kpiValue
    ) external virtual override validDate(date) onlyUnpaused onlyRole(KPI_DATA_MANAGER_ROLE) {
        if (date >= block.timestamp) revert InvalidDate(date);
        KpiStorage storage kpiStorage = _getKpiStorage();

        kpiStorage.kpiData[date].value += kpiValue;
        kpiStorage.kpiData[date].exists = true;

        emit KpiDataAdded(date, kpiValue);
    }

    function getKpiData(
        uint256 fromDate,
        uint256 toDate
    ) external view override validDate(fromDate) validDate(toDate) returns (uint256 kpiAggregatedValue, bool exists) {
        if (fromDate > toDate) revert InvalidDateRange(fromDate, toDate);

        KpiStorage storage kpiStorage = _getKpiStorage();

        for (uint256 date = fromDate; date <= toDate; ) {
            IKpi.KpiEntry storage kpiData = kpiStorage.kpiData[date];

            if (kpiData.exists) {
                kpiAggregatedValue += kpiData.value;
                exists = true;
            }

            unchecked {
                ++date;
            }
        }
        return (kpiAggregatedValue, exists);
    }

    function initialize(IResolverProxy.Rbac[] memory rbacs) public onlyUninitialized(_getKpiStorage().initialized) {
        KpiStorage storage kpiStorage = _getKpiStorage();
        kpiStorage.initialized = true;
        for (uint256 rbacIndex; rbacIndex < rbacs.length; rbacIndex++) {
            for (uint256 memberIndex; memberIndex < rbacs[rbacIndex].members.length; memberIndex++) {
                _grantRole(rbacs[rbacIndex].role, rbacs[rbacIndex].members[memberIndex]);
            }
        }
    }

    function _getKpiStorage() internal pure returns (KpiStorage storage kpiStorage) {
        assembly {
            kpiStorage.slot := KPI_STORAGE_LOCATION
        }
    }
}
