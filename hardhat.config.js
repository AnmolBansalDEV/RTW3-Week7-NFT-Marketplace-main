require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
const fs = require('fs');
// const infuraId = fs.readFileSync(".infuraid").toString().trim() || "";

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();
  for (const account of accounts) {
    console.log(account.address);
  }
});

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 1337
    },
    goerli: {
      // url: `${process.env.REACT_APP_ALCHEMY_API_URL}`,
      url: "https://eth-goerli.g.alchemy.com/v2/o_k6aMQ5efRuFvO2g0HdiFD7DA7-oFUW",
      accounts: ["6f4c51d4fdd1d460cac8084c49818a5ec525f8060a994b5ad3c41a5c70dc9fe2"]
    }
  },
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
};