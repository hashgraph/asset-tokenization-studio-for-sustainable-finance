// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {ArraysUpgradeable} from '@openzeppelin/contracts-upgradeable/utils/ArraysUpgradeable.sol';
import {Initializable} from '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
import {OwnableUpgradeable} from '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';
import {PausableUpgradeable} from '@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol';

import './interfaces/IKPI.sol';

contract KPI is IKPI, Initializable, OwnableUpgradeable, PausableUpgradeable {
    using ArraysUpgradeable for uint256[];

    // keccak256(abi.encode(uint256(keccak256("kpi.storage.main")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant MAIN_STORAGE_LOCATION =
        0x7951b57d34492147b02ce280f4a5a3e267a90c41bb73a92f7e5957582ef3b4cc;

    function initialize() external initializer {
        __Ownable_init();
        __Pausable_init();
    }

    function _getKPIStorage()
        private
        pure
        returns (KPIStorage storage kpiStorage)
    {
        assembly {
            kpiStorage.slot := MAIN_STORAGE_LOCATION
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

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function addKPIData(
        uint256 _date,
        uint256 _kpiValue
    )
        external
        override
        validDate(_date)
        validValue(_kpiValue)
        whenNotPaused
        onlyOwner
    {
        KPIStorage storage kpiStorage = _getKPIStorage();

        kpiStorage.kpiData[_date] = KPIEntry({value: _kpiValue, exists: true});

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
