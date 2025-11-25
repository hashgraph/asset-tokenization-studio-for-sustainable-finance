// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// solhint-disable max-line-length
import { Initializable } from "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import { ArraysUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/ArraysUpgradeable.sol";
import { AccessControl } from "@hashgraph/asset-tokenization-contracts/contracts/layer_1/accessControl/AccessControl.sol";
import { Pause } from "@hashgraph/asset-tokenization-contracts/contracts/layer_1/pause/Pause.sol";
import { IResolverProxy } from "@hashgraph/asset-tokenization-contracts/contracts/interfaces/resolver/resolverProxy/IResolverProxy.sol";
import { KPI_DATA_MANAGER_ROLE } from "./constants/roles.sol";
// solhint-disable-next-line no-unused-import
import { KPI_STORAGE_LOCATION } from "./constants/storageLocation.sol";
import { IKpi } from "./interfaces/IKpi.sol";
// solhint-enable max-line-length

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
        uint256 toDate,
        uint256 kpiValue
    ) external virtual override validDate(toDate) onlyUnpaused onlyRole(KPI_DATA_MANAGER_ROLE) {
        if (toDate >= _blockTimestamp()) revert InvalidDate(toDate);
        KpiStorage storage kpiStorage = _getKpiStorage();
        if (kpiStorage.kpiData[toDate].exists) {
            revert KpiDataAlreadyExists(toDate);
        }

        uint256 insertIndex = kpiStorage.timestampsIndex.findUpperBound(toDate);
        kpiStorage.timestampsIndex.push(0);
        for (uint256 i = kpiStorage.timestampsIndex.length - 1; i > insertIndex; i--) {
            kpiStorage.timestampsIndex[i] = kpiStorage.timestampsIndex[i - 1];
            kpiStorage.kpiData[kpiStorage.timestampsIndex[i]].index = i;
        }
        kpiStorage.timestampsIndex[insertIndex] = toDate;

        kpiStorage.kpiData[toDate] = KpiEntry({ value: kpiValue, index: insertIndex, exists: true });

        emit KpiDataAdded(toDate, kpiValue);
    }

    function getKpiData(
        uint256 fromDate,
        uint256 toDate
    ) external view override validDate(fromDate) validDate(toDate) returns (uint256 kpiAggregatedValue, bool exists) {
        if (fromDate > toDate) revert InvalidDateRange(fromDate, toDate);

        KpiStorage storage kpiStorage = _getKpiStorage();
        uint256 startIndex;
        uint256 endIndex;

        // Optimization: Fast path using direct lookup if dates exist exactly
        // This avoids binary search when querying with exact stored dates (common case)
        if (kpiStorage.kpiData[fromDate].exists) {
            // fromDate exists exactly - use stored index directly (O(1))
            startIndex = kpiStorage.kpiData[fromDate].index;

            if (kpiStorage.kpiData[toDate].exists) {
                // Both dates exist exactly - use stored index directly (O(1))
                endIndex = kpiStorage.kpiData[toDate].index;
            } else {
                // toDate doesn't exist - use binary search (O(log n))
                endIndex = kpiStorage.timestampsIndex.findUpperBound(toDate + 1);
            }
        } else if (kpiStorage.kpiData[toDate].exists) {
            // toDate exists but fromDate doesn't - use toDate index and binary search for fromDate
            // This is efficient: O(1) for toDate + O(log n) for fromDate
            endIndex = kpiStorage.kpiData[toDate].index;
            startIndex = kpiStorage.timestampsIndex.findUpperBound(fromDate);
        } else {
            // Neither date exists - fallback to binary search for both (O(log n))
            startIndex = kpiStorage.timestampsIndex.findUpperBound(fromDate);
            endIndex = kpiStorage.timestampsIndex.findUpperBound(toDate + 1);
        }

        // Sum all KPI values in the range [startIndex, endIndex]
        for (uint256 i = startIndex; i <= endIndex; i++) {
            uint256 timestamp = kpiStorage.timestampsIndex[i];
            KpiEntry storage kpiData = kpiStorage.kpiData[timestamp];

            kpiAggregatedValue += kpiData.value;
        }

        exists = (startIndex <= endIndex);

        return (kpiAggregatedValue, exists);
    }

    function initialize(IResolverProxy.Rbac[] memory rbacs) public onlyUninitialized(_getKpiStorage().initialized) {
        KpiStorage storage kpiStorage = _getKpiStorage();
        kpiStorage.initialized = true;
        for (uint256 rbacIndex; rbacIndex < rbacs.length; ++rbacIndex) {
            for (uint256 memberIndex; memberIndex < rbacs[rbacIndex].members.length; ++memberIndex) {
                _grantRole(rbacs[rbacIndex].role, rbacs[rbacIndex].members[memberIndex]);
            }
        }
    }

    function _getKpiStorage() internal pure returns (KpiStorage storage kpiStorage) {
        // solhint-disable-next-line no-inline-assembly
        assembly {
            kpiStorage.slot := KPI_STORAGE_LOCATION
        }
    }
}
