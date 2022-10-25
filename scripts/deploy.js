import hre from "hardhat";
async function main() {
  const Notario = await hre.ethers.getContractFactory("Notario");
  const notario = await Notario.deploy();

  await notario.deployed();

  console.log("Notario deployed to:", notario.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
