import { NavLink } from 'react-router-dom';

const NotFoundPage = () => {
    return (
        <div className="grid grid-cols-1 space-y-4">
            <h1 className="text-center text-2xl text-white">404</h1>
            <h1 className="text-center text-2xl text-white">Page Not Found</h1>
            <div className="flex justify-center">
                <NavLink to="/" className={'text-primary underline'}>
                    Back to Home Page
                </NavLink>
            </div>
        </div>
    );
};

export default NotFoundPage;
