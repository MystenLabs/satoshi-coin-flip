import { SuiWallet } from './SuiWallet';
import { Balance } from './Balance';
import { NavLink } from 'react-router-dom';
import { Address } from './Address';

export const Header = () => {

    return (
        <header
            className="grid w-full grid-cols-12 px-4 py-1 text-white"
            style={{ backdropFilter: 'blur(10px)' }}
        >
            <div className="col-span-6 grid grid-cols-12 place-content-center place-items-start gap-y-4 md:flex md:items-center md:justify-start md:space-x-10">
                <NavLink to="/" className="col-span-12 text-2xl text-primary hover:text-primary">
                    Satoshi Coin Flip
                </NavLink>
                {/* {navigationLinks.map(({ label, path, active }) => (
                    <NavLink
                        to={path}
                        key={path}
                        className={`col-span-12 hover:text-primary ${active ? 'text-primary' : ''}`}
                    >
                        {label}
                    </NavLink>
                ))} */}
            </div>
            <div className="col-span-6 grid grid-cols-2 place-content-center place-items-end gap-y-4 md:flex md:items-center md:justify-end md:space-x-4">
                <div className="col-span-2 flex justify-end">
                    <Balance />
                </div>
                <div className="col-span-2 flex justify-end">
                    <Address />
                </div>
                <div className="col-span-2 flex justify-end">
                    <SuiWallet />
                </div>
            </div>
        </header>
    );
};
