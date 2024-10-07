import React from 'react';
import { Navigate } from 'react-router-dom';
import { AuthService } from '../Cookies/AuthService';

const ProtectedRoute = ({ children }) => {
    const user = AuthService.getUser(); 

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (user.rol !== 'administrador') {
        return <Navigate to="/" />;
    }

    return children;
};

export default ProtectedRoute;
