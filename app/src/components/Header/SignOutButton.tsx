import { useEnokiFlow } from '@mysten/enoki/react';
import { Button } from '../General/Button';

interface SignOutButtonProps {
    text: string;
}

export const SignOutButton = ({ text }: SignOutButtonProps) => {
    const enokiFlow = useEnokiFlow();

    const handleLogout = async () => {
        //     window.history.replaceState('', document.title, window.location.pathname);
        // }
        await enokiFlow.logout();
    };

    return (
        <>
            <Button
                // to={loginUrl}
                onClick={handleLogout}
                size="small"
                className="font-bull-text-bold flex items-center rounded-[58px] bg-slate-600 px-10 py-2  text-white hover:cursor-pointer hover:bg-slate-200 hover:text-black"
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
        </>
    );
};
