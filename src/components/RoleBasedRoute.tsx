import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface RoleBasedRouteProps {
    allowedRoles: string[];
}

export const RoleBasedRoute = ({ allowedRoles }: RoleBasedRouteProps) => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!user || !allowedRoles.includes(user.role)) {
        // Redirect based on role if possible, or just to login/unauthorized
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};
