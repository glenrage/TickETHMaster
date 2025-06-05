require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();

const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;
const BASESCAN_API_KEY = process.env.BASESCAN_API_KEY;

if (
  !DEPLOYER_PRIVATE_KEY &&
  process.env.NODE_ENV !== 'test' &&
  process.argv[2] !== 'node'
) {
  // NODE_ENV !== 'test' ensures we don't warn during tests
  // process.argv[2] !== 'node' ensures we don't warn when just starting a local hardhat node
  console.warn(
    'WARNING: DEPLOYER_PRIVATE_KEY not set in .env file. ' +
      'Set it if you intend to deploy to a live network.'
  );
}

module.exports = {
  solidity: {
    version: '0.8.20', // Match your contract pragma
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      // Configuration for the local Hardhat Network
      // chainId: 31337, // Default
    },
    baseGoerli: {
      url: 'https://goerli.base.org',
      accounts: DEPLOYER_PRIVATE_KEY ? [DEPLOYER_PRIVATE_KEY] : [],
      chainId: 84531,
      // gasPrice: ethers.utils.parseUnits("0.1", "gwei").toNumber(), // Example: set gas price if needed
    },
    // baseMainnet: { // For future production deployment
    //   url: "https://mainnet.base.org",
    //   accounts: DEPLOYER_PRIVATE_KEY ? [DEPLOYER_PRIVATE_KEY] : [],
    //   chainId: 8453,
    // },
  },
  etherscan: {
    // For contract verification on BaseScan
    apiKey: {
      baseGoerli: BASESCAN_API_KEY || '', // Must be a string
      // base: BASESCAN_API_KEY || "", // For Base Mainnet
    },
    customChains: [
      {
        network: 'baseGoerli',
        chainId: 84531,
        urls: {
          apiURL: 'https://api-goerli.basescan.org/api',
          browserURL: 'https://goerli.basescan.org',
        },
      },
      // { // For Base Mainnet
      //   network: "base",
      //   chainId: 8453,
      //   urls: {
      //     apiURL: "https://api.basescan.org/api",
      //     browserURL: "https://basescan.org",
      //   },
      // },
    ],
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
};
