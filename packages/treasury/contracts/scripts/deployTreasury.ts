import { ethers } from "hardhat"

async function deployTreasury(): Promise<void> {
    const treasury = await (
        await ethers.getContractFactory("PortfolioProceedsManagementFacet")
    ).deploy()

    await treasury.initialize_Portfolio("0x0000000000000000000000000000000000068cda", [])
    console.log("Treasury address:", treasury.address)
}

deployTreasury()