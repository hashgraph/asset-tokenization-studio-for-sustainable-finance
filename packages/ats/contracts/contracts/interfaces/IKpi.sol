// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// solhint-disable-next-line max-line-length
import { IResolverProxy } from "@hashgraph/asset-tokenization-contracts/contracts/interfaces/resolver/resolverProxy/IResolverProxy.sol";

/**
 * @title IKpi Interface
 * @author Green Bonds Platform Team
 * @notice Interface for managing Key Performance Indicator (Kpi) data in green bonds platform
 * @dev This interface defines the standard for storing and retrieving Kpi data with optimized queries
 */
interface IKpi {
    /**
     * @notice Struct containing Kpi entry for a specific date
     * @param value The Kpi value for the given date
     * @param index The index of the Kpi entry in the timestamps array
     */
    struct KpiEntry {
        uint256 value;
        uint256 index;
        bool exists;
    }

    /**
     * @notice Storage structure for Kpi data using unstructured storage pattern
     * @param KpiData Mapping from timestamp to KpiEntry struct
     * @param timestampsIndex Array of timestamps for efficient range queries
     * @param initialized Boolean flag indicating if the storage has been initialized
     * @param minValidDate Minimum valid date from which KPI data is accepted (0 = no minimum)
     */
    struct KpiStorage {
        mapping(uint256 timestamp => KpiEntry) kpiData;
        uint256[] timestampsIndex;
        bool initialized;
        uint256 minValidDate;
    }

    /**
     * @notice Emitted when new Kpi data is added
     * @param date The timestamp for which Kpi data was added
     * @param value The Kpi value that was recorded
     */
    // solhint-disable-next-line gas-indexed-events
    event KpiDataAdded(uint256 indexed date, uint256 value);

    /**
     * @notice Emitted when the minimum valid date is updated
     * @param newMinValidDate The new minimum valid date
     */
    event MinValidDateUpdated(uint256 newMinValidDate);

    /**
     * @notice Thrown when an invalid date (zero or negative) is provided
     * @param providedDate The invalid date that was provided
     */
    error InvalidDate(uint256 providedDate);

    /**
     * @notice Thrown when trying to add Kpi data for a date that already has data
     * @param date The date for which Kpi data already exists
     */
    error KpiDataAlreadyExists(uint256 date);

    /**
     * @notice Thrown when an invalid date range is provided (fromDate > toDate)
     * @param fromDate The start date of the invalid range
     * @param toDate The end date of the invalid range
     */
    error InvalidDateRange(uint256 fromDate, uint256 toDate);

    /**
     * @notice Thrown when trying to access Kpi data that doesn't exist
     * @param requestedDate The date for which no Kpi data exists
     */
    error KpiDataNotFound(uint256 requestedDate);

    /**
     * @notice Thrown when trying to add KPI data with a date before the minimum valid date
     * @param providedDate The date that was provided
     * @param minValidDate The minimum valid date configured
     */
    error DateBeforeMinimum(uint256 providedDate, uint256 minValidDate);

    function initialize(IResolverProxy.Rbac[] memory rbacs) external;

    /**
     * @notice Adds Kpi data for a specific date
     * @dev If data already exists for the given date, it reverts with KpiDataAlreadyExists.
     *      Data is automatically inserted in sorted order regardless of insertion sequence.
     * @param toDate The timestamp representing the date of the Kpi measurement (must be > 0 and < block.timestamp)
     * @param kpiValue The Kpi value to store (must be > 0)
     */
    function addKpiData(uint256 toDate, uint256 kpiValue) external;

    /**
     * @notice Retrieves aggregated Kpi data for a date range
     * @dev Optimized to use direct lookup (O(1)) when querying exact stored dates,
     *      otherwise falls back to binary search (O(log n)). Returns the sum of all Kpi values
     *      within the specified date range (inclusive on both ends).
     * @param fromDate The start date of the range (inclusive, must be > 0)
     * @param toDate The end date of the range (inclusive, must be > 0 and >= fromDate)
     * @return kpiAggregatedValue The sum of all Kpi values in the specified date range
     */
    function getKpiData(uint256 fromDate, uint256 toDate) external view returns (uint256 kpiAggregatedValue);

    /**
     * @notice Sets the minimum valid date for KPI data
     * @dev Only callable by KPI_DATA_MANAGER_ROLE. Once set, addKpiData will reject dates before this minimum.
     *      Set to 0 to disable minimum date validation.
     * @param newMinValidDate The minimum valid date timestamp (0 to disable)
     */
    function setMinValidDate(uint256 newMinValidDate) external;
}
