import { ConnectButton, useCurrentAccount, useDisconnectWallet } from '@mysten/dapp-kit';
import { Button } from '../General/Button';

export const SuiWallet = () => {
    const { mutate: disconnect } = useDisconnectWallet();
    const currentAccount = useCurrentAccount();

    const handleSignOut = () => {
        disconnect();
    };

    return (
        <>
            {/* Show unified wallet connect button that includes both standard wallets and Enoki wallets */}
            {!currentAccount && (
                <ConnectButton />
            )}

            {/* Show sign out button when connected */}
            {currentAccount && (
                <Button
                    onClick={handleSignOut}
                    size="small"
                    className="font-bull-text-bold flex items-center rounded-[58px] bg-slate-600 px-10 py-2 text-white hover:cursor-pointer hover:bg-slate-200 hover:text-black"
                >
                    <div className="pr-2 font-[500]">Sign out</div>
                </Button>
            )}
        </>
    );
};
