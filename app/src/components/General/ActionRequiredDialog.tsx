import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Button } from './Button';
import { BallTriangle } from 'react-loader-spinner';

interface RecentHistoryDialogProps {
    isOpen: boolean;
    mintCounterNFT: () => void;
    creationLoading: boolean;
    counterNFT: any | null;
    onClose: () => void;
}

export const ActionRequiredDialog = ({
    isOpen,
    mintCounterNFT,
    creationLoading,
    counterNFT,
    onClose,
}: RecentHistoryDialogProps) => {
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
                        <Dialog.Title className="flex justify-between px-2 py-1">
                            <div className="mx-auto text-2xl font-bold text-white">
                                First time here?
                            </div>
                        </Dialog.Title>
                        <div className="mt-2 w-full grid-cols-1 place-items-center space-y-4 text-white">
                            {!creationLoading && !counterNFT && (
                                <div className="text-center text-sm">
                                    You need a counter NFT before playing, so that we can keep track
                                    of your games, and generate the required randomness for flipping
                                    a coin before each game.
                                </div>
                            )}
                            {creationLoading && (
                                <div className="flex flex-col justify-center pb-2">
                                    <div className="text-center text-xl">Creating Counter NFT </div>
                                    <div className="mx-auto pt-2">
                                        <BallTriangle width={45} height={45} color="#FFD600" />
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-center space-x-2 pb-2">
                                <Button
                                    size="medium"
                                    onClick={mintCounterNFT}
                                    disabled={creationLoading}
                                >
                                    Get Counter NFT
                                </Button>
                            </div>
                        </div>
                    </Dialog.Panel>
                </Transition.Child>
            </Dialog>
        </Transition>
    );
};
