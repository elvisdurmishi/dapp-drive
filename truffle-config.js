const path = require("path");
const HDWalletProvider = require('@truffle/hdwallet-provider');
require('dotenv').config();

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "src/contracts"),
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id
    },
    rinkeby: {
      provider: () => new HDWalletProvider(process.env.MNEMONIC, "https://rinkeby.infura.io/v3/" + process.env.INFURA_API_KEY),
      network_id: 4,       // Ropsten's id
      gas: 300000,        // Ropsten has a lower block limit than mainnet
      confirmations: 0,    // # of confs to wait between deployments. (default: 0)
      skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
    }
  },
};
