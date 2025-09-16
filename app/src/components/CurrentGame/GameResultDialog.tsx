import { CloseIcon } from '../../icons/tsx/CloseIcon';
import { CoinSide, GameResult } from '../../types/GameHistory';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import lost_icon from '../../icons/svg/capy_lost_icon.svg';
import won_icon from '../../icons/svg/trophy_won_icon.svg';
import { Button } from '../General/Button';
import { LinkExternal } from '../../icons/tsx/LinkExternal';
import { useConfig } from '../../hooks/useConfig';
import { MIST_PER_SUI } from '@mysten/sui.js/utils';

interface GameResultDialogProps {
    result: GameResult | null;
    choice: CoinSide | null;
    txnDigest: string | null;
    isOpen: boolean;
    onClose: () => void;
    onShowAllResultsDialog: () => void;
}

export const GameResultDialog = ({
    result,
    choice,
    txnDigest,
    isOpen,
    onClose,
    onShowAllResultsDialog,
}: GameResultDialogProps) => {
    const { FULL_NODE, GAME_BALANCE } = useConfig({});

    const handleShowGameDetails = () => {
        // open in a new tab the link
        const network = FULL_NODE.includes('localhost')
            ? 'local'
            : FULL_NODE.includes('devnet')
            ? 'devnet'
            : FULL_NODE.includes('testnet')
            ? 'testnet'
            : 'mainnet';
        const url = `https://suiscan.xyz/${network}/tx/${txnDigest}`;
        window.open(url, '_blank');
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog
                as="div"
                className="fixed inset-0 z-10 flex items-center justify-center"
                onClose={onClose}
            >
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <Dialog.Panel className="w-full max-w-xl transform overflow-hidden rounded-2xl bg-gray-900 py-4 shadow-xl transition-all">
                        {!!result && (
                            <>
                                <Dialog.Title className="flex justify-end px-2 py-1">
                                    <button onClick={onClose}>
                                        <CloseIcon className="w-6" color="white" />
                                    </button>
                                </Dialog.Title>
                                <div className="mt-2 w-full grid-cols-1 place-items-center space-y-4">
                                    <img
                                        className={`col-span-1 mx-auto ${
                                            result === 'win' ? '' : 'pl-8'
                                        }`}
                                        src={result === 'win' ? won_icon : lost_icon}
                                        alt={result}
                                    />
                                    <div
                                        className={`text-center text-2xl font-bold ${
                                            result === 'win' ? 'text-green-500' : 'text-red-500'
                                        }`}
                                    >
                                        {result === 'win' ? '+' : '-'}{' '}
                                        {(+GAME_BALANCE * (result === 'win' ? 2 : 1)) /
                                            Number(MIST_PER_SUI)}{' '}
                                        SUI
                                    </div>
                                    <div className="text-center text-2xl font-bold text-white">
                                        {result === 'win' ? 'You won!' : 'You lost!'}
                                    </div>
                                    <div className="text-center text-lg text-white">
                                        {result === 'win'
                                            ? `Congratulations! You picked '${choice}' and you won!`
                                            : `You picked '${choice}' and lost this game.`}
                                    </div>
                                    <div className="flex items-center justify-center space-x-2">
                                        <Button variant="contained" size="small" onClick={onClose}>
                                            New Game
                                        </Button>
                                        {txnDigest && (
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={handleShowGameDetails}
                                            >
                                                <div className="flex space-x-2">
                                                    <div>Game Details</div>
                                                    <LinkExternal className="w-4" />
                                                </div>
                                            </Button>
                                        )}
                                        {/* <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={onShowAllResultsDialog}
                                        >
                                            View Recent History
                                        </Button> */}
                                    </div>
                                </div>
                            </>
                        )}
                    </Dialog.Panel>
                </Transition.Child>
            </Dialog>
        </Transition>
    );
};
