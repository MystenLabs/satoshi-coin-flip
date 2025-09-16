import { useEnokiFlow } from '@mysten/enoki/react';
import { useEffect, useState } from 'react';
// import { useAuthentication } from '../../contexts/Authentication/Authentication';
import { Button } from '../General/Button';

interface SignInButtonProps {
    text: string;
}

export const SignInButton = ({ text }: SignInButtonProps) => {
    const enokiFlow = useEnokiFlow();
    const [isLoading, setIsLoading] = useState(false);

    const loginEnoki = async () => {
        try {
            setIsLoading(true);
            console.log('state', await enokiFlow.getSession());
            const authUrl = await enokiFlow.createAuthorizationURL({
                provider: 'google',
                clientId: '50060024202-3m1ruh1frqt0skl6nsied0oaf2gnscd3.apps.googleusercontent.com',
                redirectUrl: window.location.href.split('#')[0],
                network: 'testnet',
            });
            window.location.href = authUrl;
        } catch (e) {
            console.error('Error during creation of authorization url:', e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            // to={loginUrl}
            onClick={loginEnoki}
            disabled={isLoading}
            size="small"
            className="font-bull-text-bold flex items-center rounded-[58px] bg-slate-600 px-10 py-2  text-white hover:cursor-pointer hover:bg-slate-200 hover:text-black disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
        >
            <img
                src={'/google.svg'}
                width={38}
                height={38}
                alt={'Google'}
                className="p-[10px]"
                loading="lazy"
            />
            <div className="pr-2 font-[500]">{text}</div>
        </Button>
    );
};
