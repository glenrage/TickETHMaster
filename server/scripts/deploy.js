const hre = require('hardhat');

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log('Deploying contracts with the account:', deployer.address);
  console.log(
    'Account balance:',
    (await hre.ethers.provider.getBalance(deployer.address)).toString()
  );

  // 1. Deploy TicketNFT
  const ticketNFTName = 'BaseSimpleTicket';
  const ticketNFTSymbol = 'BST';
  const TicketNFTFactory = await hre.ethers.getContractFactory('TicketNFT');
  // Pass deployer's address as initialOwner for Ownable
  const ticketNFT = await TicketNFTFactory.deploy(
    ticketNFTName,
    ticketNFTSymbol,
    deployer.address
  );
  await ticketNFT.waitForDeployment(); // Replaces .deployed()
  const ticketNFTAddress = await ticketNFT.getAddress();
  console.log(
    `TicketNFT "${ticketNFTName}" (${ticketNFTSymbol}) deployed to: ${ticketNFTAddress}`
  );

  // 2. Deploy EventManager, passing the TicketNFT address
  const EventManagerFactory = await hre.ethers.getContractFactory(
    'EventManager'
  );
  const eventManager = await EventManagerFactory.deploy(ticketNFTAddress);
  await eventManager.waitForDeployment();
  const eventManagerAddress = await eventManager.getAddress();
  console.log(`EventManager deployed to: ${eventManagerAddress}`);

  // 3. Transfer ownership of TicketNFT to EventManager contract
  // This allows EventManager to mint tickets.
  console.log(
    `Transferring ownership of TicketNFT (${ticketNFTAddress}) to EventManager (${eventManagerAddress})...`
  );
  const tx = await ticketNFT
    .connect(deployer)
    .transferOwnership(eventManagerAddress);
  await tx.wait(); // Wait for the transaction to be mined
  console.log('Ownership of TicketNFT transferred to EventManager.');
  const newOwner = await ticketNFT.owner();
  console.log('Current owner of TicketNFT is now:', newOwner);

  console.log('\n--- Deployment Summary ---');
  console.log('TicketNFT Address:', ticketNFTAddress);
  console.log('EventManager Address:', eventManagerAddress);

  // Instructions for verification (optional, if BASESCAN_API_KEY is set)
  if (process.env.BASESCAN_API_KEY && hre.network.name === 'baseGoerli') {
    console.log('\nTo verify contracts on BaseScan Goerli, run:');
    console.log(
      `npx hardhat verify --network baseGoerli ${ticketNFTAddress} "${ticketNFTName}" "${ticketNFTSymbol}" "${deployer.address}"`
    );
    console.log(
      `npx hardhat verify --network baseGoerli ${eventManagerAddress} ${ticketNFTAddress}`
    );
    console.log('Wait a bit for propagation before verifying.');
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
