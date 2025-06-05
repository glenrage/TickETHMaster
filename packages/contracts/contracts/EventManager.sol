// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./TicketNFT.sol"; // Make sure the path is correct

contract EventManager {
    TicketNFT public ticketNFT;

    struct Event {
        uint256 eventId;
        string name;
        address organizer;
        uint256 ticketPrice;
        uint256 totalTickets;
        uint256 soldTickets;
    }

    struct TicketListing {
        uint256 tokenId;
        address seller;
        uint256 price;
        bool active;
    }

    uint256 private _nextEventId;
    mapping(uint256 => Event) public events;
    mapping(uint256 => TicketListing) public resaleListings;
    mapping(uint256 => uint256) public ticketToEventMap;

    event EventCreated(
        uint256 indexed eventId,
        string name,
        address indexed organizer,
        uint256 ticketPrice,
        uint256 totalTickets
    );
    event TicketPurchased(
        uint256 indexed eventId,
        uint256 indexed tokenId,
        address indexed buyer,
        string metadataURI
    );
    event TicketListed(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price
    );
    event TicketResold(
        uint256 indexed tokenId,
        address indexed newOwner,
        uint256 price
    );

    constructor(address _ticketNFTAddress) {
        ticketNFT = TicketNFT(_ticketNFTAddress);
    }

    function createEvent(
        string memory name,
        uint256 ticketPrice,
        uint256 totalTickets
    ) external returns (uint256) {
        require(ticketPrice > 0, "Price must be > 0");
        require(totalTickets > 0, "Must have tickets");
        uint256 eventId = _nextEventId++;
        events[eventId] = Event(
            eventId,
            name,
            msg.sender,
            ticketPrice,
            totalTickets,
            0
        );
        emit EventCreated(eventId, name, msg.sender, ticketPrice, totalTickets);
        return eventId;
    }

    function buyTicket(uint256 eventId) external payable {
        Event storage currentEvent = events[eventId];
        require(currentEvent.organizer != address(0), "Event does not exist");
        require(msg.value == currentEvent.ticketPrice, "Incorrect ETH sent");
        require(
            currentEvent.soldTickets < currentEvent.totalTickets,
            "Sold out"
        );

        currentEvent.soldTickets++;
        // Simple metadata: "Event Name - Ticket ID for Event #X"
        // Note: This metadata is very basic.
        string memory metadata = string(
            abi.encodePacked(
                currentEvent.name,
                " - Ticket #",
                currentEvent.soldTickets,
                " for EventID ",
                currentEvent.eventId
            )
        );
        uint256 tokenId = ticketNFT.mintTicket(msg.sender, metadata);
        ticketToEventMap[tokenId] = eventId;

        // Transfer funds to organizer
        (bool success, ) = payable(currentEvent.organizer).call{
            value: msg.value
        }("");
        require(success, "Transfer failed.");

        emit TicketPurchased(eventId, tokenId, msg.sender, metadata);
    }

    function listTicketForResale(uint256 tokenId, uint256 price) external {
        require(ticketNFT.ownerOf(tokenId) == msg.sender, "Not owner");
        require(price > 0, "Price must be > 0");
        // IMPORTANT: Frontend must ensure user calls `approve` on TicketNFT contract first
        // for this EventManager address and this specific tokenId.
        require(
            ticketNFT.getApproved(tokenId) == address(this),
            "EventManager not approved for this token"
        );

        resaleListings[tokenId] = TicketListing(
            tokenId,
            msg.sender,
            price,
            true
        );
        emit TicketListed(tokenId, msg.sender, price);
    }

    function buyResaleTicket(uint256 tokenId) external payable {
        TicketListing storage listing = resaleListings[tokenId];
        require(listing.active, "Listing not active");
        require(msg.value == listing.price, "Incorrect ETH sent");
        require(
            ticketNFT.ownerOf(tokenId) == listing.seller,
            "Seller no longer owns token"
        );

        address seller = listing.seller;
        listing.active = false;

        ticketNFT.safeTransferFrom(seller, msg.sender, tokenId);

        (bool success, ) = payable(seller).call{value: msg.value}("");
        require(success, "Transfer failed.");

        emit TicketResold(tokenId, msg.sender, listing.price);
    }

    // --- View functions for frontend ---
    function getEventDetails(
        uint256 eventId
    ) external view returns (Event memory) {
        return events[eventId];
    }

    function getResaleListing(
        uint256 tokenId
    ) external view returns (TicketListing memory) {
        return resaleListings[tokenId];
    }

    function getNextEventId() external view returns (uint256) {
        return _nextEventId;
    }
}
