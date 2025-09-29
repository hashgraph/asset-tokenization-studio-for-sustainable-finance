// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// solhint-disable max-line-length
import {IFactory as IAtsFactory} from '@hashgraph/asset-tokenization-contracts/contracts/interfaces/factory/IFactory.sol';
import {FactoryRegulationData as AtsFactoryRegulationData} from '@hashgraph/asset-tokenization-contracts/contracts/layer_3/constants/regulation.sol';
// solhint-enable max-line-length

/**
 * @title MockAtsFactory
 * @notice Mock implementation of ATS Factory for testing purposes
 */
contract MockAtsFactory {
    bool public shouldRevert;
    bool public shouldReturnZeroAddress;
    address public nextBondAddress;

    event MockBondDeployed(
        address bondAddress,
        IAtsFactory.BondData bondData,
        AtsFactoryRegulationData regulationData
    );

    constructor() {
        shouldRevert = false;
        shouldReturnZeroAddress = false;
        nextBondAddress = address(0x1234567890123456789012345678901234567890);
    }

    function setShouldRevert(bool _shouldRevert) external {
        shouldRevert = _shouldRevert;
    }

    function setShouldReturnZeroAddress(bool _shouldReturnZero) external {
        shouldReturnZeroAddress = _shouldReturnZero;
    }

    function setNextBondAddress(address _bondAddress) external {
        nextBondAddress = _bondAddress;
    }

    function deployBond(
        IAtsFactory.BondData calldata bondData,
        AtsFactoryRegulationData calldata regulationData
    ) external returns (address bondAddress) {
        if (shouldRevert) {
            revert('MockAtsFactory: deployBond reverted');
        }

        if (shouldReturnZeroAddress) {
            return address(0);
        }

        bondAddress = nextBondAddress;
        emit MockBondDeployed(bondAddress, bondData, regulationData);

        // Increment address for next deployment
        nextBondAddress = address(uint160(nextBondAddress) + 1);
    }
}
