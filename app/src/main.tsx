import './index.css';
import Plausible from 'plausible-tracker';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { router } from './routes';
import { EnokiFlowProvider } from '@mysten/enoki/react';
import { useConfig } from './hooks/useConfig';

const plausible = Plausible({});
plausible.enableAutoPageviews();
const config = useConfig({});
console.log('API URL: ', config.API_BASE_URL);
console.log('Package ID: ', config.PACKAGE_ID);
console.log('House Data: ', config.HOUSE_DATA);
console.log('FN URL: ', config.FULL_NODE);
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <EnokiFlowProvider apiKey={config.ENOKI_API_KEY}>
                <RouterProvider router={router} />
            </EnokiFlowProvider>
        </QueryClientProvider>
        ,
    </React.StrictMode>,
);
