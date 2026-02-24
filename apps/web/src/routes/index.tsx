
import Auth from '@/pages/auth';
import NotFound from '@/component/not-found';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import ClassRoom from '@/layouts/teacher/class/class-room';
import Replay from '@/component/reply';
import { Provider } from 'react-redux';
import { store } from '@/store';

const router = createBrowserRouter([
    {
        path: '/',
        element: <Navigate to="/auth" replace />,
    },
    {
        path: '/auth',
        element: <Auth />
    },
    {
        path: '/replay',
        element: <Provider store={store}><Replay /> </Provider>
    },
    {
        path: "*",
        element: <NotFound />,
    },
    {
        path: "teacher/board",
        element: <ClassRoom />,
    },

])


export default router