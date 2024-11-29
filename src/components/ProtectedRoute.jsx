import React from 'react';
import { Navigate } from 'react-router-dom';
import { AuthService } from '../Cookies/AuthService';

const ProtectedRoute = ({ children }) => {
    const user = AuthService.getUser()
    const currentPath = window.location.pathname

    if (!user) {
        return <Navigate to="/login" />
    }
    // Acceso específico para la ruta /Operador
    if (currentPath == '/admin') {
        if (user.rol !== 'Admin' && user.rol !== 'Operador') {
            return <Navigate to="/" />
        }
    }
    // Acceso a rutas de Admin
    const adminRoutes = ['/admin', '/users', '/categorias', '/marcas']
    if (adminRoutes.includes(currentPath) && user.rol !== 'Admin') {
        return <Navigate to="/" />
    }

    // Acceso a rutas de Admin
    const operRoutes = ['/manage-products']
    if (operRoutes.includes(currentPath) && user.rol !== 'Operador' && user.rol !== 'Admin') {
        return <Navigate to="/" />
    }

    return children
}

export default ProtectedRoute;
