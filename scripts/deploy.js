const hre = require("hardhat")

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

// deployment
async function main() {
  const [deployer] = await ethers.getSigners()

  const CharlAR = await ethers.getContractFactory("CharlAR")
  const charlar = await CharlAR.deploy()
  await charlar.deployed()

  console.log("CharlAR deployed to:", charlar.address)

  // create 3 channels
  const NAMES = ["general", "lounge1", "lounge2"]
  const COSTS = [tokens(1), tokens(0), tokens(0.25)]
  
  for (let i = 0; i < NAMES.length; i++) {
    const transaction = await charlar.connect(deployer).create_channel(NAMES[i], COSTS[i])
    await transaction.wait()

    console.log(`Channel ${NAMES[i]} created`)
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});