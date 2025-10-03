import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext';
import DashboardBase from '../ui/DashboardBase';
import { useEffect } from 'react';

export default function ProtectedRoute() {
    let { auth } = useAuthContext();
    const { pathname } = useLocation();

    if (!auth) {
        return <Navigate to={`/login`} replace />;
    }

    useEffect(function() {
		window.scrollTo(0, 0)
	}, [pathname]);
    
    return (
        <DashboardBase>
            <Outlet />
        </DashboardBase>
    );
};