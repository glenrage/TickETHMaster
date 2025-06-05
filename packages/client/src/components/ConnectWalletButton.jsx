// src/components/ConnectWalletButton.jsx
import { ConnectWallet } from '@coinbase/onchainkit/wallet';
import { Avatar, Name } from '@coinbase/onchainkit/identity';
import { useAccount } from 'wagmi';

// Basic styling for the connected user display
const connectedUserStyle = {
  display: 'flex',
  alignItems: 'center',
  padding: '5px 10px',
  border: '1px solid #ccc',
  borderRadius: '4px',
  background: '#f9f9f9',
};

export default function ConnectWalletButton() {
  const { address, isConnected } = useAccount();

  return (
    <ConnectWallet>
      {isConnected && address && (
        <div style={connectedUserStyle}>
          <Avatar address={address} className='h-6 w-6' />{' '}
          <Name address={address} />
        </div>
      )}
    </ConnectWallet>
  );
}
