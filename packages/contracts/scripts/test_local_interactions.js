// scripts/test_local_interactions.js
const { ethers } = require('hardhat');

async function main() {
  console.log('--- Starting Local Interaction Test ---');

  // --- THESE ADDRESSES MUST MATCH YOUR LOCAL DEPLOYMENT ---
  const ticketNFTAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // Paste from your deploy output
  const eventManagerAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'; // Paste from your deploy output

  console.log(`Attaching to TicketNFT at: ${ticketNFTAddress}`);
  console.log(`Attaching to EventManager at: ${eventManagerAddress}`);

  const TicketNFT = await ethers.getContractFactory('TicketNFT');
  const EventManager = await ethers.getContractFactory('EventManager');

  const ticketNFT = TicketNFT.attach(ticketNFTAddress);
  const eventManager = EventManager.attach(eventManagerAddress);

  const [owner, addr1, addr2] = await ethers.getSigners();
  console.log('\n--- Accounts ---');
  console.log('Owner (Deployer):', owner.address);
  console.log('Addr1:', addr1.address);
  console.log('Addr2:', addr2.address);

  // 4. Test Event Creation
  console.log('\n--- Testing Event Creation ---');
  const eventName = 'Cool Local Concert Script Test';
  const ticketPrice = ethers.parseEther('0.01');
  const totalTickets = BigInt(100);

  console.log(`Addr1 (${addr1.address}) creating event "${eventName}"...`);
  let tx = await eventManager
    .connect(addr1)
    .createEvent(eventName, ticketPrice, totalTickets);
  let receipt = await tx.wait();
  console.log('Event created! Transaction hash:', receipt.hash);

  const eventId = 0; // Assuming this is the first event created by this script run / contract state
  const eventDetails = await eventManager.getEventDetails(eventId);
  console.log(
    'Event Details:',
    eventDetails.name,
    'Price:',
    ethers.formatEther(eventDetails.ticketPrice),
    'Sold:',
    eventDetails.soldTickets.toString()
  );

  // 5. Test Ticket Purchase
  console.log('\n--- Testing Ticket Purchase ---');
  const firstTicketId = BigInt(0); // Assuming this is the first ticket minted since contract deployment / state reset

  console.log(`Addr2 (${addr2.address}) buying ticket for event ${eventId}...`);
  tx = await eventManager
    .connect(addr2)
    .buyTicket(eventId, { value: ticketPrice });
  receipt = await tx.wait();
  console.log('Ticket bought by Addr2! Transaction hash:', receipt.hash);

  const ownerOfTicket = await ticketNFT.ownerOf(firstTicketId);
  console.log(`Owner of ticket ID ${firstTicketId}:`, ownerOfTicket);
  const ticketURI = await ticketNFT.tokenURI(firstTicketId);
  console.log(`Token URI for ticket ID ${firstTicketId}:`, ticketURI);

  const updatedEventDetails = await eventManager.getEventDetails(eventId);
  console.log(
    'Updated Sold Tickets:',
    updatedEventDetails.soldTickets.toString()
  );

  // 6. Test Listing for Resale
  console.log('\n--- Testing Listing for Resale ---');
  const resalePrice = ethers.parseEther('0.015');

  console.log(
    `Addr2 (${addr2.address}) approving EventManager for ticket ID ${firstTicketId}...`
  );
  tx = await ticketNFT
    .connect(addr2)
    .approve(eventManagerAddress, firstTicketId);
  await tx.wait();
  console.log('Approval successful.');

  console.log(
    `Addr2 (${addr2.address}) listing ticket ID ${firstTicketId} for resale...`
  );
  tx = await eventManager
    .connect(addr2)
    .listTicketForResale(firstTicketId, resalePrice);
  receipt = await tx.wait();
  console.log('Ticket listed for resale! Transaction hash:', receipt.hash);
  const listing = await eventManager.getResaleListing(firstTicketId);
  console.log(
    'Resale listing active:',
    listing.active,
    'Seller:',
    listing.seller,
    'Price:',
    ethers.formatEther(listing.price)
  );

  // 7. Test Buying Resale Ticket
  console.log('\n--- Testing Buying Resale Ticket ---');
  console.log(
    `Owner (${owner.address}) buying resale ticket ID ${firstTicketId} from Addr2...`
  );
  tx = await eventManager
    .connect(owner)
    .buyResaleTicket(firstTicketId, { value: resalePrice });
  receipt = await tx.wait();
  console.log('Resale ticket bought by Owner! Transaction hash:', receipt.hash);

  const newOwnerOfTicket = await ticketNFT.ownerOf(firstTicketId);
  console.log(`New owner of ticket ID ${firstTicketId}:`, newOwnerOfTicket);
  const updatedListing = await eventManager.getResaleListing(firstTicketId);
  console.log('Resale listing active after sale:', updatedListing.active);

  console.log('\n--- Local Interaction Test Complete ---');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
