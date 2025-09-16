import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import info_image from '../../icons/svg/info.svg';

export const InfoIcon = () => {
    let [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <div className="absolute bottom-0 left-0 px-8 py-16">
                <button
                    className="border-[1px] border-[#CCCCCC] bg-white opacity-80 hover:bg-gray-100"
                    onClick={() => setIsOpen(true)}
                >
                    <img width={40} height={40} src={info_image} alt="Info" />
                </button>

                <Dialog open={isOpen} className="relative z-50" onClose={() => setIsOpen(false)}>
                    <div className="fixed inset-0 w-screen overflow-y-auto p-4">
                        <div className="flex min-h-full items-center justify-center">
                            <Dialog.Panel className="w-full max-w-md space-y-[10px] rounded-xl bg-white p-6">
                                <Dialog.Title className="font-bold">Game Rules</Dialog.Title>
                                <div className="space-y-[10px] bg-transparent text-sm text-black text-opacity-80">
                                    <div>
                                        We present a fair method to use the Sui blockchain to
                                        conduct a 50/50 game of chance. We model the example after a
                                        2-sided coin flip with a 50% chance for each outcome, Tails
                                        or Heads.
                                    </div>
                                    <div>
                                        Upon initiating the game, the player is presented with two
                                        buttons. Selecting 'Pick Heads' triggers a coin flip. If the
                                        outcome is Heads, the player wins. Otherwise, the player
                                        loses. Conversely, selecting 'Pick Tails' triggers a coin
                                        flip. If the outcome is Tails, the player wins. Otherwise,
                                        the player loses.
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </div>
                    </div>
                </Dialog>
            </div>
        </>
    );
};
