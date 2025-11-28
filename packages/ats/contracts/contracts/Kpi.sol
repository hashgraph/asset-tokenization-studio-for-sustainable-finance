// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// solhint-disable max-line-length
import { Initializable } from "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import { AccessControl } from "@hashgraph/asset-tokenization-contracts/contracts/layer_1/accessControl/AccessControl.sol";
import { Pause } from "@hashgraph/asset-tokenization-contracts/contracts/layer_1/pause/Pause.sol";
import { IResolverProxy } from "@hashgraph/asset-tokenization-contracts/contracts/interfaces/resolver/resolverProxy/IResolverProxy.sol";
import { DateTime } from "@quant-finance/solidity-datetime/contracts/DateTime.sol";
import { KPI_DATA_MANAGER_ROLE } from "./constants/roles.sol";
// solhint-disable-next-line no-unused-import
import { KPI_STORAGE_LOCATION } from "./constants/storageLocation.sol";
import { IKpi } from "./interfaces/IKpi.sol";
// solhint-enable max-line-length

contract Kpi is IKpi, AccessControl, Pause, Initializable {
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

        if (kpiStorage.exists[toDate]) {
            revert KpiDataAlreadyExists(toDate);
        }

        // Store the value
        kpiStorage.kpiValues[toDate] = kpiValue;
        kpiStorage.exists[toDate] = true;

        // Extract date components
        (uint256 year, uint256 month, uint256 day) = DateTime.timestampToDate(toDate);

        // Update hierarchical sums
        uint256 dayKey = year * 10000 + month * 100 + day;
        uint256 monthKey = year * 100 + month;
        uint256 yearKey = year;

        kpiStorage.dailySums[dayKey] += kpiValue;
        kpiStorage.monthlySums[monthKey] += kpiValue;
        kpiStorage.yearlySums[yearKey] += kpiValue;

        // Add to day bucket (maintains insertion order within day)
        kpiStorage.dayTimestamps[dayKey].push(toDate);

        emit KpiDataAdded(toDate, kpiValue);
    }

    function getKpiData(
        uint256 fromDate,
        uint256 toDate
    ) external view override validDate(fromDate) validDate(toDate) returns (uint256 kpiAggregatedValue) {
        if (fromDate > toDate) revert InvalidDateRange(fromDate, toDate);
        KpiStorage storage kpiStorage = _getKpiStorage();

        uint256 current = fromDate;

        while (current <= toDate) {
            (uint256 year, uint256 month, uint256 day) = DateTime.timestampToDate(current);

            // Calculate period boundaries
            uint256 nextYearStart = DateTime.timestampFromDate(year + 1, 1, 1);
            uint256 nextMonthStart = DateTime.addMonths(
                DateTime.timestampFromDate(year, month, 1),
                1
            );
            uint256 nextDayStart = DateTime.addDays(
                DateTime.timestampFromDate(year, month, day),
                1
            );

            // CASE 1: Full year (starts Jan 1 and entire year fits in range)
            if (day == 1 && month == 1 && (nextYearStart - 1) <= toDate) {
                kpiAggregatedValue += kpiStorage.yearlySums[year];
                current = nextYearStart;
                continue;
            }

            // CASE 2: Full month (starts day 1 and entire month fits in range)
            if (day == 1 && (nextMonthStart - 1) <= toDate) {
                kpiAggregatedValue += kpiStorage.monthlySums[year * 100 + month];
                current = nextMonthStart;
                continue;
            }

            // CASE 3: Full day
            if (current <= DateTime.timestampFromDate(year, month, day) && (nextDayStart - 1) <= toDate) {
                kpiAggregatedValue += kpiStorage.dailySums[year * 10000 + month * 100 + day];
                current = nextDayStart;
                continue;
            }

            // CASE 4: Partial day - iterate through timestamps
            uint256[] storage timestamps = kpiStorage.dayTimestamps[year * 10000 + month * 100 + day];

            for (uint256 i = 0; i < timestamps.length; i++) {
                if (timestamps[i] >= fromDate && timestamps[i] <= toDate) {
                    kpiAggregatedValue += kpiStorage.kpiValues[timestamps[i]];
                }
            }

            current = nextDayStart;
        }

        return kpiAggregatedValue;
    }

    function initialize(IResolverProxy.Rbac[] memory rbacs) public override onlyUninitialized(_getKpiStorage().initialized) {
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
