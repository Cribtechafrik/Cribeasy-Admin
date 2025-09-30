import { Outlet, Navigate } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext';
import DashboardBase from '../ui/DashboardBase';

export default function ProtectedRoute() {
    let { auth } = useAuthContext();

    if (!auth) {
        return <Navigate to={`/login`} replace />;
    }
    
    return (
        <DashboardBase>
            <Outlet />
        </DashboardBase>
    );
};