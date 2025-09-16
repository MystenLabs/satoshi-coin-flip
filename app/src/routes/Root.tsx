import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
// import { WalletKitProvider } from '@mysten/wallet-kit';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Header } from '../components/Header/Header';
import { Footer } from '../components/Footer';
import { InfoIcon } from '../components/General/InfoIcon';
import { BalanceProvider } from '../contexts/Balance/BalanceProvider';
import { BackgroundElements } from '../components/General/BackgroundElements';

export default function Root() {
    return (
        // <WalletKitProvider enableUnsafeBurner={import.meta.env.DEV}>
        <BalanceProvider>
            <Toaster position="bottom-center" />
            <div className="sticky top-0 z-50 flex w-full items-center justify-evenly bg-white px-5 py-3">
                <span className="text-[14px] text-[#4F4F4F] text-opacity-90">
                    [Satoshi Coin Flip] is provided for testnet purposes only and does not involve
                    real money or the opportunity to win real money.
                </span>
            </div>
            <Header />
            <main className="relative flex flex-[1] flex-col">
                <BackgroundElements />
                <div className="z-[1] flex flex-[1] flex-col items-center justify-center">
                    <Outlet />
                    <InfoIcon />
                    <Footer />
                </div>
                {import.meta.env.DEV && <ReactQueryDevtools position="bottom-right" />}
            </main>
        </BalanceProvider>
        // </WalletKitProvider>
    );
}
