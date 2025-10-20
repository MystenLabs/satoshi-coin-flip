import './index.css';
import '@mysten/dapp-kit/dist/index.css';
import Plausible from 'plausible-tracker';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client';
import { namedPackagesPlugin, Transaction } from '@mysten/sui/transactions';
import { router } from './routes';
import { RegisterEnokiWallets } from './components/RegisterEnokiWallets';
import { getMvrCache } from '../mvr';

const plausible = Plausible({});
plausible.enableAutoPageviews();

// Register MVR plugin globally
const network = 'testnet';
const mvrPlugin = namedPackagesPlugin({
  url: `https://${network}.mvr.mystenlabs.com`,
  overrides: getMvrCache(network),
});
Transaction.registerGlobalSerializationPlugin('namedPackagesPlugin', mvrPlugin);

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider
        networks={{
          testnet: {
            url: getFullnodeUrl('testnet'),
          },
          mainnet: {
            url: getFullnodeUrl('mainnet'),
          },
          devnet: {
            url: getFullnodeUrl('devnet'),
          },
          localnet: {
            url: 'http://localhost:9000',
          },
        }}
        defaultNetwork="testnet"
      >
        <WalletProvider autoConnect>
          <RegisterEnokiWallets />
          <RouterProvider router={router} />
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
