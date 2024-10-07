import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthService } from "../Cookies/AuthService";
import { HiOutlineShoppingCart } from "react-icons/hi2";

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [user, setUser] = useState(null)

    useEffect(() => {
        const loggedUser = AuthService.getUser()
        setUser(loggedUser)
    }, [setUser])

    const handleLogout = () => {
        AuthService.logout()
        setUser(null)
    }

    return (
        <nav className="bg-gray-800 text-white shadow-lg">
            <div className="container mx-auto px-4 py-2 flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold hover:text-gray-400">
                    Ecommerce
                </Link>

                {/* Menu en escritorio */}
                <ul className="hidden md:flex space-x-12">
                    <li><Link to="/productos" className="hover:text-gray-400">PRODUCTOS</Link></li>
                    <li><Link to="/contacto" className="hover:text-gray-400">AYUDA</Link></li>
                </ul>

                {/*Login-Register*/}
                <div className="hidden md:flex items-center space-x-6">
                    {user ? (
                        <>
                            <span>{user.nombre.toUpperCase()} {user.apellido.toUpperCase()}</span>
                            <button className="bg-gray-700 px-3 py-2 rounded hover:bg-gray-600" onClick={handleLogout}>
                                Cerrar Sesión
                            </button>
                            <Link to='/carrito' className="bg-gray-700 px-3 py-2 rounded hover:bg-gray-600">
                                <HiOutlineShoppingCart />
                                <span className="ml-2">Carrito</span>
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="hover:text-gray-400">Iniciar Sesión</Link>
                            <Link to="/register" className="hover:text-gray-400">Registrarse</Link>
                            <Link to='/carrito' className="bg-gray-700 px-2 py-1 rounded hover:bg-gray-600 flex items-center">
                                <span className="text-base"><HiOutlineShoppingCart /></span> 
                                <span className="ml-2 text-base">Carrito</span> 
                            </Link>

                        </>
                    )}
                </div>

                {/*Menu Toggle */}
                <div className="md:hidden">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="text-gray-400 hover:text-white focus:outline-none"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Menu isMenuOpen true) */}
            {isMenuOpen && (
                <div className="md:hidden">
                    <ul className="space-y-4 px-2 py-2 bg-gray-700">
                        <li><Link to="/" className="block hover:text-gray-400">Inicio</Link></li>
                        <li><Link to="/productos" className="block hover:text-gray-400">Productos</Link></li>
                        <li><Link to="/nosotros" className="block hover:text-gray-400">Nosotros</Link></li>
                        <li><Link to="/contacto" className="block hover:text-gray-400">Contacto</Link></li>
                        {user ? (
                            <>
                                <li className="block text-white">Hola, {user.nombre}</li>
                                <li><button className="block hover:text-gray-400" onClick={handleLogout}>Cerrar Sesión</button></li>
                            </>
                        ) : (
                            <>
                                <li><Link to="/login" className="block hover:text-gray-400">Iniciar Sesión</Link></li>
                                <li><Link to="/register" className="block hover:text-gray-400">Registrarse</Link></li>
                            </>
                        )}
                    </ul>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
