// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// solhint-disable max-line-length
import { Kpi } from "./Kpi.sol";
import { TimeTravelStorageWrapper } from "@hashgraph/asset-tokenization-contracts/contracts/test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { KPI_DATA_MANAGER_ROLE } from "./constants/roles.sol";
// solhint-enable max-line-length

/**
 * @title KpiTimeTravel
 * @notice TimeTravel variant of Kpi contract for testing time-dependent logic
 * @dev Extends Kpi with TimeTravelStorageWrapper to override block.timestamp usage
 */
contract KpiTimeTravel is Kpi, TimeTravelStorageWrapper {
    /**
     * @notice Adds KPI data for a specific date (TimeTravel version)
     * @dev Overrides Kpi.addKpiData to use _blockTimestamp() instead of block.timestamp
     * @param date The date for which KPI data is being added (must be in the past)
     * @param kpiValue The KPI value to add for the given date
     */
    function addKpiData(
        uint256 date,
        uint256 kpiValue
    ) external override validDate(date) whenKpiNotPaused onlyKpiRole(KPI_DATA_MANAGER_ROLE) {
        // Use TimeTravel's _blockTimestamp() instead of block.timestamp
        if (date >= _blockTimestamp()) revert InvalidDate(date);

        KpiStorage storage kpiStorage = _getKpiStorage();

        kpiStorage.kpiData[date].value += kpiValue;
        kpiStorage.kpiData[date].exists = true;

        emit KpiDataAdded(date, kpiValue);
    }

    /**
     * @notice Set the mocked blockchain timestamp for testing
     * @param newTimestamp The new timestamp to set
     */
    function changeSystemTimestamp(uint256 newTimestamp) external {
        _changeSystemTimestamp(newTimestamp);
    }

    /**
     * @notice Reset the mocked blockchain timestamp to use real block.timestamp
     */
    function resetSystemTimestamp() external {
        _resetSystemTimestamp();
    }

    /**
     * @dev Override _blockTimestamp to use TimeTravel's mocked timestamp
     * @return Current timestamp (mocked if set, otherwise real block.timestamp)
     */
    function _blockTimestamp() internal view override returns (uint256) {
        return TimeTravelStorageWrapper._blockTimestamp();
    }

    /**
     * @dev Override _blockNumber to use TimeTravel's mocked block number
     * @return Current block number (mocked if set, otherwise real block.number)
     */
    function _blockNumber() internal view override returns (uint256) {
        return TimeTravelStorageWrapper._blockNumber();
    }
}
