// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// solhint-disable max-line-length
import { Initializable } from "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import { ArraysUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/ArraysUpgradeable.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { Pausable } from "@openzeppelin/contracts/security/Pausable.sol";
import { IResolverProxy } from "@hashgraph/asset-tokenization-contracts/contracts/interfaces/resolver/resolverProxy/IResolverProxy.sol";
import { KPI_DATA_MANAGER_ROLE } from "./constants/roles.sol";
import { _PAUSER_ROLE } from "@hashgraph/asset-tokenization-contracts/contracts/layer_1/constants/roles.sol";
// solhint-disable-next-line no-unused-import
import { KPI_STORAGE_LOCATION } from "./constants/storageLocation.sol";
import { IKpi } from "./interfaces/IKpi.sol";
// solhint-enable max-line-length

contract Kpi is IKpi, AccessControl, Pausable, Initializable {
    using ArraysUpgradeable for uint256[];

    event TokenPaused(address indexed account);
    event TokenUnpaused(address indexed account);

    error AccountHasNoRole(bytes32 role, address account);
    error TokenIsPaused();
    error AlreadyInitialized();

    modifier onlyKpiRole(bytes32 role) {
        if (!hasRole(role, msg.sender)) revert AccountHasNoRole(role, msg.sender);
        _;
    }

    modifier whenKpiNotPaused() {
        if (paused()) revert TokenIsPaused();
        _;
    }

    modifier validDate(uint256 _date) {
        if (_date == 0) revert InvalidDate(_date);
        _;
    }

    constructor() {
        _disableInitializers();
    }

    function pause() external onlyKpiRole(_PAUSER_ROLE) whenKpiNotPaused {
        _pause();
        emit TokenPaused(msg.sender);
    }

    function unpause() external onlyKpiRole(_PAUSER_ROLE) {
        _unpause();
        emit TokenUnpaused(msg.sender);
    }

    function addKpiData(
        uint256 date,
        uint256 kpiValue
    ) external virtual override validDate(date) whenKpiNotPaused onlyKpiRole(KPI_DATA_MANAGER_ROLE) {
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

    function initialize(IResolverProxy.Rbac[] memory rbacs) public {
        KpiStorage storage kpiStorage = _getKpiStorage();
        if (kpiStorage.initialized) revert AlreadyInitialized();
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
