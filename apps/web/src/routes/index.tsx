
import Auth from '@/pages/auth';
import NotFound from '@/component/not-found';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import ClassRoom from '@/layouts/teacher/class/class-room';
import Replay from '@/component/reply';

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
        element: <Replay />
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