import React, { useEffect, useState, useRef, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthService } from "../Cookies/AuthService";
import { HiOutlineShoppingCart } from "react-icons/hi2";
import { FiSearch, FiX } from "react-icons/fi";
import { FaCat, FaSignInAlt, FaUserCircle } from "react-icons/fa";
import { LuUser } from "react-icons/lu";
import { LuLogOut } from "react-icons/lu";
import { HiMenu } from "react-icons/hi";
import { CartContext } from "./Context/CartContext";
import { GiCat } from "react-icons/gi";
import { motion } from 'framer-motion'; 

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [user, setUser] = useState(null)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const { cartItems } = useContext(CartContext)
    const [searchQuery, setSearchQuery] = useState("")
    const navigate = useNavigate()
    const [suggestions, setSuggestions] = useState([]);
    const dropdownRef = useRef(null)
    const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0)

    const [hovered, setHovered] = useState(false);
    const [animate, setAnimate] = useState(false);
    const suggestionsRef = useRef(null); 

    useEffect(() => {
        const interval = setInterval(() => {
            setAnimate(prev => !prev); 
        }, 3000); // 3000 ms = 3 segundos

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const loggedUser = AuthService.getUser()
        setUser(loggedUser)
    }, []);

    const handleLogout = () => {
        AuthService.logout()
        setUser(null)
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen)
    };

    const toggleSearch = () => {
        setIsSearchOpen(!isSearchOpen)
    };


    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false)
            }
        };
        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef])

    const handleMyAccountClick = () => {
        closeDropdown()
    }
    //busqueda desde api
    const handleSearchChange = async (event) => {
        setSearchQuery(event.target.value);
        if (event.target.value.length > 0) {
            try {
                const response = await fetch(`http://localhost:3000/products/search?q=${event.target.value}&limit=5`);
                const data = await response.json();
                setSuggestions(data); // Actualiza el estado de sugerencias
            } catch (error) {
                console.error("Error fetching suggestions:", error);
            }
        } else {
            setSuggestions([]); 
        }
    };

    const handleSearchSubmit = (event) => {
        event.preventDefault();
        navigate('/search-results', { state: { searchQuery } });
        setSearchQuery("");
        setSuggestions([]);
    };

    // Cierra las sugerencias si se hace clic fuera de ellas
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
                setSuggestions([]);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <nav className="bg-gradient-to-r from-[#0D1F2D] via-[#1d2e3d] to-[#354656] text-white shadow-xl fixed top-0 left-0 w-full z-50">
            <div className="mx-auto px-2 py-3 flex justify-between items-center">

                {/* Menu desplegable para movil a la izquierda */}
                <div className="md:hidden flex items-center">
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-400 hover:text-white focus:outline-none">
                        {isMenuOpen ? <FiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Logo proximamente */}
                <Link
                    to="/"
                    className="text-4xl font-bold hover:text-teal-300 ml-4 flex items-center"
                >
                    <motion.div
                        animate={{
                            y: animate ? [-10, 0, -10] : 0,
                            scale: animate ? 1.2 : 1,
                            rotate: animate ? 10 : 0,
                        }}
                        transition={{
                            duration: 0.6,
                            type: "spring",
                            stiffness: 200,
                            damping: 10,
                        }}
                    >
                        <FaCat className="mr-2" />
                    </motion.div>

                    <motion.span
                        animate={{
                            opacity: animate ? 1 : 0.3,
                            x: animate ? 20 : 0,
                        }}
                        transition={{
                            duration: 0.4,
                            ease: "easeOut",
                        }}
                        className="ml-2 text-teal-200"
                    >
                        CyberCat
                    </motion.span>
                </Link>

                {/* Barra de búsqueda */}
                <form onSubmit={handleSearchSubmit} className="relative w-96">
                    <div className="items-center w-full max-w-sm md:max-w-md hidden md:flex">
                        <input
                            type="text"
                            placeholder="Buscá por productos, marcas y categorías"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="flex-grow rounded-l-md border border-gray-300 px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4a9d9c]"
                        />
                        <button
                            type="submit"
                            onClick={handleSearchSubmit}
                            className="bg-[#354656] text-white px-4 py-2 rounded-r-md hover:bg-[#2b7d7a] focus:outline-none flex items-center justify-center ml-1"
                        >
                            <FiSearch className="text-2xl" />
                        </button>
                    </div>

                    {/* Sugerencias solo para pantallas grandes */}
                    {!isSearchOpen && suggestions.length > 0 && (
                        <ul ref={suggestionsRef} className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-md shadow-lg">
                            {suggestions.map((product) => (
                                <li
                                    key={product.cod_prod}
                                    className="px-4 py-2 hover:bg-gray-100 transition-colors cursor-pointer"
                                >
                                    <Link to={`/products/${product.cod_prod}`}>
                                        <span className="text-gray-700 truncate whitespace-nowrap block">
                                            {product.prod_nombre}
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </form>

                <div className="md:hidden">
                    <button
                        onClick={toggleSearch}
                        className="text-white px-4 py-2 rounded-r-md hover:text-gray-400 focus:outline-none flex items-center justify-center"
                    >
                        <FiSearch className="text-xl" />
                    </button>
                </div>

                {/* Icono de cuenta y carrito en pantallas chicas */}
                <div className="flex items-center space-x-4 md:hidden">
                    {user ? (
                        <p className="text-lg font-semibold">{user.nombre}</p>
                    ) : (
                        <Link to="/login" className="flex items-center space-x-1">
                            <FaSignInAlt className="text-2xl hover:text-gray-400" />
                            <span>Login</span>
                        </Link>
                    )}
                    <Link to="/carrito" className="relative">
                        <HiOutlineShoppingCart className="text-2xl hover:text-teal-500" />
                        {totalItems > 0 && (
                            <span className="absolute -top-2 right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center transform">
                                {totalItems}
                            </span>
                        )}
                    </Link>
                </div>

                {/* Login/Register y carrito en pantallas grandes */}
                <div className="hidden md:flex items-center space-x-6">
                    {user ? (
                        <div className="relative flex items-center space-x-4" ref={dropdownRef}>
                            {/* Boton para desplegar el dropdown */}
                            <button onClick={toggleDropdown} className="flex items-center space-x-2 focus:outline-none">
                                <FaUserCircle className="text-2xl " />
                                <span className="font-bold hover:text-teal-500">{user.nombre.toUpperCase()}</span>
                            </button>

                            {/* Dropdown de perfil */}
                            {isDropdownOpen && (
                                <div className="absolute top-full mt-2 right-0 w-48 bg-white text-black rounded-md shadow-lg z-20 transition ease-out duration-75">
                                    {user.rol === 'Admin' ? (
                                        <Link to="/admin" className="px-4 py-2 hover:bg-gray-200 flex items-center" onClick={handleMyAccountClick}>
                                            <LuUser className="text-xl" />Panel Admin
                                        </Link>
                                    ) : user.rol === 'Operador' ? (
                                        <Link to="/operador" className="px-4 py-2 hover:bg-gray-200 flex items-center" onClick={handleMyAccountClick}>
                                            <LuUser className="text-xl" />Panel Operador
                                        </Link>
                                    ) : (
                                        <Link to="/profile" className="px-4 py-2 hover:bg-gray-200 flex items-center" onClick={handleMyAccountClick}>
                                            <LuUser className="text-xl" />Mi cuenta
                                        </Link>
                                    )}
                                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-gray-200 flex items-center">
                                        <LuLogOut className="text-xl" />Cerrar Sesión
                                    </button>
                                </div>
                            )}

                            {/* Carrito */}
                            {user && user.rol !== 'Admin' && user.rol !== 'Operador' && (
                                <Link to="/carrito" className="relative">
                                    <HiOutlineShoppingCart className="text-3xl hover:text-teal-500 mr-6" />
                                    {totalItems > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center transform">
                                            {totalItems}
                                        </span>
                                    )}
                                </Link>
                            )}

                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="hover:bg-teal-700 font-bold px-2 py-1 rounded">Iniciar Sesión</Link>
                            <Link to="/carrito" className="hover:bg-teal-700 rounded relative flex items-center p-2">
                                <HiOutlineShoppingCart className="text-3xl hover:text-white mr-2" />
                                {totalItems > 0 && (
                                    <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                        {totalItems}
                                    </span>
                                )}
                            </Link>
                        </>
                    )}
                </div>
            </div>

            {/* Barra de búsqueda para pantallas pequeñas */}
            {isSearchOpen && (
                <form className="flex flex-col items-center px-4 py-2 bg-[#354656] md:hidden" onSubmit={handleSearchSubmit}>
                    <div className="relative flex items-center w-full">
                        <input
                            type="text"
                            id="simple-search"
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-[#4a9d9c] focus:border-[#4a9d9c] block w-full p-2.5"
                            placeholder="Buscá por productos, marcas y categorías"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            required
                        />
                        {isSearchOpen && suggestions.length > 0 && (
                            <ul
                                ref={suggestionsRef}
                                className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg"
                            >
                                {suggestions.map((product) => (
                                    <li
                                        key={product.cod_prod}
                                        className="px-4 py-2 hover:bg-gray-100 transition-colors cursor-pointer"
                                    >
                                        <Link to={`/products/${product.cod_prod}`}>
                                            <span className="text-gray-700 truncate whitespace-nowrap block">
                                                {product.prod_nombre}
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <button
                            type="submit"
                            className="p-3 ml-2 text-sm font-medium text-black bg-[#4a9d9c] rounded-lg border border-black hover:bg-teal-700 hover:backdrop-blur-md hover:text-white transition-all duration-[.25s] focus:ring-4 focus:outline-none focus:ring-blue-300"
                        >
                            <FiSearch />
                        </button>
                    </div>
                </form>
            )}


            {/* Menu desplegable cuando menuopen es true */}
            {isMenuOpen && (
                <div className="md:hidden">
                    <ul className="space-y-4 px-2 py-2 bg-[#354656]">
                        <li><Link to="/productos" className="block hover:text-gray-400">Productos</Link></li>
                        <li><Link to="/ayuda" className="block hover:text-gray-400">Ayuda</Link></li>
                        {user ? (
                            <>
                                {user.rol === 'Admin' ? (
                                    <Link to="/admin" className="px-4 py-2 hover:bg-gray-500 flex items-center" onClick={handleMyAccountClick}>
                                        <LuUser className="text-xl" />Panel Admin
                                    </Link>
                                ) : user.rol === 'Operador' ? (
                                    <Link to="/operador" className="px-4 py-2 hover:bg-gray-500 flex items-center" onClick={handleMyAccountClick}>
                                        <LuUser className="text-xl" />Panel Operador
                                    </Link>
                                ) : (
                                    <Link to="/profile" className="px-4 py-2 hover:bg-gray-500 flex items-center" onClick={handleMyAccountClick}>
                                        <LuUser className="text-xl" />Mi cuenta
                                    </Link>
                                )}
                                <li><button className="block hover:text-gray-400" onClick={handleLogout}>Cerrar Sesión</button></li>
                            </>
                        ) : (
                            <li><Link to="/login" className="block hover:text-gray-400">Iniciar Sesión</Link></li>
                        )}
                    </ul>
                </div>
            )}

            {/* Sección de productos y ayuda, se oculta cuando la pantalla es chica */}
            <div className="bg-gradient-to-r from-[#0D1F2D] via-[#1d2e3d] to-[#354656] py-2 md:block hidden">
                <div className="container mx-auto flex justify-center space-x-72 font-bold">
                    <Link to="/productos" className="text-white hover:text-teal-500 transition-transform duration-300 hover:scale-110"> PRODUCTOS
                    </Link>
                    <Link to="/ayuda" className="text-white hover:text-teal-500 transition-transform duration-300 hover:scale-110">AYUDA</Link>
                </div>
            </div>
        </nav>
    );

}

export default Navbar;