import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { RecentHistory } from './RecentHistory';
import { CloseIcon } from '../../icons/tsx/CloseIcon';

interface RecentHistoryDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export const RecentHistoryDialog = ({ isOpen, onClose }: RecentHistoryDialogProps) => {
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
                    <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-gray-900 py-4 shadow-xl transition-all">
                        <Dialog.Title className="flex justify-between px-2 py-1">
                            <div className="text-xl font-bold text-white">Recent History</div>
                            <button onClick={onClose}>
                                <CloseIcon className="w-6" color="white" />
                            </button>
                        </Dialog.Title>
                        <div className="mt-2 w-full">
                            <RecentHistory showHeader={false} fullWidth isPaginationEnabled />
                        </div>
                    </Dialog.Panel>
                </Transition.Child>
            </Dialog>
        </Transition>
    );
};
