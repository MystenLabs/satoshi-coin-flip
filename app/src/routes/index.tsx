import { Suspense, lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';

const LazyHomePage = lazy(() => import('../pages/HomePage'));
const LazyNotFoundPage = lazy(() => import('../pages/NotFoundPage'));
const LazyRoot = lazy(() => import('./Root'));

export const router = createBrowserRouter([
    {
        path: '/',
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <LazyRoot />
            </Suspense>
        ),
        children: [
            {
                path: '',
                element: (
                    <Suspense fallback={<div>Loading...</div>}>
                        <LazyHomePage />
                    </Suspense>
                ),
            },
            // {
            //     path: 'how-to-play',
            //     element: (
            //         <Suspense fallback={<div>Loading...</div>}>
            //             <LazyHowToPlayPage />
            //         </Suspense>
            //     ),
            // },
            // {
            //     path: 'about',
            //     element: (
            //         <Suspense fallback={<div>Loading...</div>}>
            //             <LazyAboutPage />
            //         </Suspense>
            //     ),
            // },
            {
                path: '*',
                element: (
                    <Suspense fallback={<div>Loading...</div>}>
                        <LazyNotFoundPage />
                    </Suspense>
                ),
            },
        ],
    },
]);
