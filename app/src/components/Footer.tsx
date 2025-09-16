import { NavLink } from 'react-router-dom';
import { MystenLabsLogo } from './General/MystenLabsLogo';

export const Footer = () => {
    return (
        <div
            className="absolute bottom-0 w-full items-center justify-center space-x-0 space-y-4 px-4 text-white sm:flex sm:justify-between sm:space-x-10 sm:space-y-0"
            style={{ backdropFilter: 'blur(10px)' }}
        >
            <div className="flex items-center justify-center space-x-4">
                <NavLink to="https://mystenlabs.com/" target="_blank" rel="noopener noreferrer">
                    <MystenLabsLogo iconClassName="h-auto w-9" textClassName="h-auto w-28" />
                </NavLink>
                <div>
                    <NavLink
                        to="https://github.com/MystenLabs/satoshi-coin-flip"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-center underline"
                    >
                        Source Code
                    </NavLink>
                </div>
            </div>
            <div className="text-center text-gray-400 sm:text-end">
                <NavLink to="/" className="text-center underline">
                    Satoshi Coin Flip
                </NavLink>{' '}
                © 2024 by{' '}
                <NavLink
                    to="https://mystenlabs.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-center underline"
                >
                    Mysten Labs
                </NavLink>
            </div>
        </div>
    );
};
