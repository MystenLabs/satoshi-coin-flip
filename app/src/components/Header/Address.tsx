import { formatAddress } from '@mysten/sui/utils';
import { useZkLogin } from '@mysten/enoki/react';
import { WalletIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

export const Address = () => {
    const { address } = useZkLogin();

    const copyAddress = () => {
        toast.success('Address copied to clipboard!');
        navigator.clipboard.writeText(address!);
    };

    if (!address) return null;
    return (
        <div
            onClick={copyAddress}
            className="flex items-center justify-center space-x-2 rounded-full border-2 border-solid border-gray-700 px-5 py-3 hover:cursor-pointer"
        >
            <WalletIcon color="#FFD600" width={24} height={24} />
            <div className="font-semibold ">{formatAddress(address!)}</div>
        </div>
    );
};
