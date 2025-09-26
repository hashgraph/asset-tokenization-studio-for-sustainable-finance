// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title IKPI Interface
 * @author Green Bonds Platform Team
 * @notice Interface for managing Key Performance Indicator (KPI) data in green bonds platform
 * @dev This interface defines the standard for storing and retrieving KPI data with optimized queries
 */
interface IKPI {
    /**
     * @notice Struct containing KPI entry for a specific date
     * @param value The KPI value for the given date
     * @param exists Boolean flag indicating if data exists for this date
     */
    struct KPIEntry {
        uint256 value;
        bool exists;
    }

    /**
     * @notice Storage structure for KPI data using unstructured storage pattern
     * @param kpiData Mapping from timestamp to KPIEntry struct
     * @param dates Array of timestamps with KPI data, maintained in sorted order for efficient queries
     */
    struct KPIStorage {
        mapping(uint256 timestamp => KPIEntry) kpiData;
        bool initialized;
    }

    /**
     * @notice Thrown when an invalid date (zero or negative) is provided
     * @param providedDate The invalid date that was provided
     */
    error InvalidDate(uint256 providedDate);

    /**
     * @notice Thrown when an invalid KPI value (zero or negative) is provided
     * @param providedValue The invalid KPI value that was provided
     */
    error InvalidKPIValue(uint256 providedValue);

    /**
     * @notice Thrown when an invalid date range is provided (fromDate > toDate)
     * @param fromDate The start date of the invalid range
     * @param toDate The end date of the invalid range
     */
    error InvalidDateRange(uint256 fromDate, uint256 toDate);

    /**
     * @notice Thrown when trying to access KPI data that doesn't exist
     * @param requestedDate The date for which no KPI data exists
     */
    error KPIDataNotFound(uint256 requestedDate);

    /**
     * @notice Emitted when new KPI data is added
     * @param date The timestamp for which KPI data was added
     * @param value The KPI value that was recorded
     */
    event KPIDataAdded(uint256 indexed date, uint256 value);

    /**
     * @notice Adds KPI data for a specific date
     * @dev If data already exists for the given date, it will be overwritten
     * @param _date The timestamp representing the date of the KPI measurement (must be > 0)
     * @param _kpiValue The KPI value to store (must be > 0)
     */
    function addKPIData(uint256 _date, uint256 _kpiValue) external;

    /**
     * @notice Retrieves aggregated KPI data for a date range
     * @dev Uses binary search for efficient range queries. Returns the sum of all KPI values
     *      within the specified date range (inclusive on both ends)
     * @param _fromDate The start date of the range (inclusive, must be > 0)
     * @param _toDate The end date of the range (inclusive, must be > 0 and >= _fromDate)
     * @return kpiAggregatedValue_ The sum of all KPI values in the specified date range
     */
    function getKPIData(
        uint256 _fromDate,
        uint256 _toDate
    ) external view returns (uint256 kpiAggregatedValue_, bool exists_);
}
