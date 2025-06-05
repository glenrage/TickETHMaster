import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

import { WagmiProvider, createConfig, http } from 'wagmi';
import { baseGoerli } from 'wagmi/chains';
import { coinbaseWallet, injected } from 'wagmi/connectors';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const config = createConfig({
  chains: [baseGoerli],
  connectors: [
    coinbaseWallet({
      appName: 'TickeETHMaster',
      preference: 'smartWalletOnly',
    }),
    injected(),
  ],
  transports: {
    [baseGoerli.id]: http(),
  },
});

const queryClient = new QueryClient();
const ONCHAINKIT_API_KEY = import.meta.env.VITE_ONCHAINKIT_API_KEY || '';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider apiKey={ONCHAINKIT_API_KEY} chain={baseGoerli}>
          <App />
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
