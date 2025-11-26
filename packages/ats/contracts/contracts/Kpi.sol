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

        // Validate against minimum valid date if set
        if (kpiStorage.minValidDate > 0 && toDate < kpiStorage.minValidDate) {
            revert DateBeforeMinimum(toDate, kpiStorage.minValidDate);
        }

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
    ) external view override validDate(fromDate) validDate(toDate) returns (uint256 kpiAggregatedValue) {
        if (fromDate > toDate) revert InvalidDateRange(fromDate, toDate);
        KpiStorage storage kpiStorage = _getKpiStorage();

        // Optimization: Fast path using direct lookup if dates exist exactly
        // This avoids binary search when querying with exact stored dates 
        uint256 startIndex = kpiStorage.kpiData[fromDate].exists
            ? kpiStorage.kpiData[fromDate].index
            : kpiStorage.timestampsIndex.findUpperBound(fromDate);
        uint256 endIndex = kpiStorage.kpiData[toDate].exists
            ? kpiStorage.kpiData[toDate].index + 1
            : kpiStorage.timestampsIndex.findUpperBound(toDate + 1);
        if (startIndex == kpiStorage.timestampsIndex.length) {
            return 0;
        }

        for (uint256 i = startIndex; i < endIndex; i++) {
            uint256 timestamp = kpiStorage.timestampsIndex[i];
            KpiEntry storage kpiData = kpiStorage.kpiData[timestamp];

            kpiAggregatedValue += kpiData.value;
        }

        return kpiAggregatedValue;
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

    function setMinValidDate(uint256 newMinValidDate) external override onlyUnpaused onlyRole(KPI_DATA_MANAGER_ROLE) {
        KpiStorage storage kpiStorage = _getKpiStorage();
        kpiStorage.minValidDate = newMinValidDate;
        emit MinValidDateUpdated(newMinValidDate);
    }

    function _getKpiStorage() internal pure returns (KpiStorage storage kpiStorage) {
        // solhint-disable-next-line no-inline-assembly
        assembly {
            kpiStorage.slot := KPI_STORAGE_LOCATION
        }
    }
}
