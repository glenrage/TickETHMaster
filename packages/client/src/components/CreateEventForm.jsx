import React, { useState } from 'react';
import {
  useWriteContract,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useAccount,
} from 'wagmi';
import { ethers } from 'ethers';
import {
  EVENT_MANAGER_ADDRESS,
  EVENT_MANAGER_ABI,
} from '../lib/contractConfig';

function CreateEventForm() {
  const { address } = useAccount();
  const [eventName, setEventName] = useState('');
  const [ticketPrice, setTicketPrice] = useState(''); // Store as string
  const [totalTickets, setTotalTickets] = useState(''); // Store as string

  const { data: simulationData, error: simulationError } = useSimulateContract({
    address: EVENT_MANAGER_ADDRESS,
    abi: EVENT_MANAGER_ABI,
    functionName: 'createEvent',
    args: [
      eventName,
      ticketPrice ? ethers.parseEther(ticketPrice) : ethers.parseEther('0'), // Convert to Wei
      totalTickets ? BigInt(totalTickets) : BigInt(0),
    ],
    query: {
      enabled: Boolean(address && eventName && ticketPrice && totalTickets), // Enable only when all fields are filled and wallet connected
    },
  });

  const {
    data: hash,
    writeContract,
    isPending: isWriteLoading,
    error: writeError,
  } = useWriteContract();

  const {
    isLoading: isTxLoading,
    isSuccess,
    error: txError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (simulationData?.request) {
      writeContract(simulationData.request);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='card'>
      <div className='form-group'>
        <label htmlFor='eventName'>Event Name:</label>
        <input
          id='eventName'
          type='text'
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          required
        />
      </div>
      <div className='form-group'>
        <label htmlFor='ticketPrice'>Ticket Price (ETH):</label>
        <input
          id='ticketPrice'
          type='number'
          step='0.0001' // Allow for smaller ETH values
          value={ticketPrice}
          onChange={(e) => setTicketPrice(e.target.value)}
          required
        />
      </div>
      <div className='form-group'>
        <label htmlFor='totalTickets'>Total Tickets:</label>
        <input
          id='totalTickets'
          type='number'
          value={totalTickets}
          onChange={(e) => setTotalTickets(e.target.value)}
          required
        />
      </div>
      <button
        type='submit'
        disabled={!simulationData?.request || isWriteLoading || isTxLoading}>
        {isWriteLoading && 'Check Wallet...'}
        {isTxLoading && 'Creating Event...'}
        {!isWriteLoading && !isTxLoading && 'Create Event'}
      </button>
      {isSuccess && (
        <div className='success-message'>
          Event Created Successfully!
          <br />
          Transaction:{' '}
          <a
            href={`https://goerli.basescan.org/tx/${hash}`}
            target='_blank'
            rel='noopener noreferrer'>
            {hash}
          </a>
        </div>
      )}
      {(simulationError || writeError || txError) && (
        <div className='error-message'>
          Error:{' '}
          {(simulationError || writeError || txError)?.shortMessage ||
            (simulationError || writeError || txError)?.message ||
            'An unknown error occurred.'}
        </div>
      )}
      {isWriteLoading && !isTxLoading && (
        <p className='loading-message'>Please confirm in your wallet...</p>
      )}
    </form>
  );
}

export default CreateEventForm;
