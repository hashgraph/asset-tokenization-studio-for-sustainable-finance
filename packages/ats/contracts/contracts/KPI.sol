// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ArraysUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/ArraysUpgradeable.sol";
import { AccessControl } from "@hashgraph/asset-tokenization-contracts/contracts/layer_1/accessControl/AccessControl.sol";
import { Pause } from "@hashgraph/asset-tokenization-contracts/contracts/layer_1/pause/Pause.sol";
import {
    _KPI_DATA_MANAGER_ROLE,
    _MAIN_STORAGE_LOCATION
} from "./constants/roles.sol";
import "./interfaces/IKPI.sol";
import { _PAUSER_ROLE } from "@hashgraph/asset-tokenization-contracts/contracts/layer_1/constants/roles.sol";

contract KPI is IKPI, AccessControl, Pause {
    using ArraysUpgradeable for uint256[];

    function initialize()
        public
        onlyUninitialized(_getKPIStorage().initialized)
    {
        KPIStorage storage kpiStorage = _getKPIStorage();
        kpiStorage.initialized = true;
        _grantRole(_KPI_DATA_MANAGER_ROLE, msg.sender);
        _grantRole(_PAUSER_ROLE, msg.sender);
    }

    function _getKPIStorage()
        private
        pure
        returns (KPIStorage storage kpiStorage)
    {
        assembly {
            kpiStorage.slot := _MAIN_STORAGE_LOCATION
        }
    }

    modifier validDate(uint256 _date) {
        if (_date == 0) revert InvalidDate(_date);
        _;
    }

    modifier validValue(uint256 _value) {
        if (_value == 0) revert InvalidKPIValue(_value);
        _;
    }

    function addKPIData(
        uint256 _date,
        uint256 _kpiValue
    )
        external
        override
        validDate(_date)
        validValue(_kpiValue)
        onlyUnpaused
        onlyRole(_KPI_DATA_MANAGER_ROLE)
    {
        KPIStorage storage kpiStorage = _getKPIStorage();

        kpiStorage.kpiData[_date] = KPIEntry({
            value: _kpiValue,
            exists: true
        });

        emit KPIDataAdded(_date, _kpiValue);
    }

    function getKPIData(
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

        KPIStorage storage kpiStorage = _getKPIStorage();
        kpiAggregatedValue_ = 0;

        for (uint256 date = _fromDate; date <= _toDate; ) {
            if (kpiStorage.kpiData[date].exists) {
                kpiAggregatedValue_ += kpiStorage.kpiData[date].value;
                exists_ = true;
            }
            unchecked {
                date = date + 1 seconds;
            }
        }
        return (kpiAggregatedValue_, exists_);
    }
}
