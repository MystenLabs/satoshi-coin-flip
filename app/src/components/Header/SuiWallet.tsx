// import { ConnectButton } from '@mysten/wallet-kit';
import { useZkLogin } from '@mysten/enoki/react';
import { SignInButton } from './SignInButton';
import { SignOutButton } from './SignOutButton';
import { useAuthCallback } from '@mysten/enoki/react';

export const SuiWallet = () => {
    const zkLogin = useZkLogin();
    useAuthCallback();

    // const handleIdToken = async (idToken: string) => {
    //     console.log('id_token: ', idToken);
    //     const res = await enokiFlow.handleAuthCallback(idToken);
    //     console.log('res', res);
    // };
    // useEffect(() => {
    //     console.log('hash', hash);
    //     let id_token = hash.split('#id_token=')[1];
    //     handleIdToken(id_token);
    //     isLoggedIn().then((res) => setLoggedIn(res));
    // }, []);
    // return <ConnectButton />;

    return (
        <>
            {!zkLogin?.address && <SignInButton text="Sign in with Google" />}
            {zkLogin?.address && <SignOutButton text="Sign out" />}
        </>
    );
};
