import { useLocation } from 'react-router-dom';

// unused for the moment, will be used in future version to display the NavLinks towards the new pages

export const useGetNavigations = () => {
    const { pathname } = useLocation();

    return {
        isAtHomePage: pathname === '/',
        navigationLinks: [
            // {
            //     label: 'How to play',
            //     path: '/how-to-play',
            //     active: pathname === '/how-to-play',
            // },
            // {
            //     label: 'About project',
            //     path: '/about',
            //     active: pathname === '/about',
            // },
            {
                label: 'Move source code',
                path: 'https://github.com/MystenLabs/satoshi-coin-flip',
                active: false,
            },
        ],
    };
};
