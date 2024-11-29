import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowDownWideShort } from "react-icons/fa6";


const Sidebar = ({ categorias, marcas }) => {
    const [isCategoriasOpen, setIsCategoriasOpen] = useState(false);
    const [isMarcasOpen, setIsMarcasOpen] = useState(false);

    const toggleCategorias = () => setIsCategoriasOpen(!isCategoriasOpen);
    const toggleMarcas = () => setIsMarcasOpen(!isMarcasOpen);

    return (
        <div className=" hidden md:block w-1/5 p-4 bg-gray-50 shadow-lg rounded-lg border border-gray-200">

            {/* Todos los productos destacado */}
            <div className="mb-6">
                <Link
                    to="/productos"
                    className="block text-black hover:bg-[#4a9d9c] transition-colors duration-300 py-3 px-4 rounded-lg text-center text-lg font-semibold shadow-md"
                >
                    Todos los productos
                </Link>
            </div>

            {/* Categorías */}
            <h2
                onClick={toggleCategorias}
                className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 cursor-pointer flex justify-between items-center"
            >
                Categorías
                <span className={`transform transition-transform ${isCategoriasOpen ? "rotate-180" : "rotate-0"}`}>
                    <FaArrowDownWideShort />
                </span>
            </h2>
            <ul
                className={`overflow-hidden transition-all duration-300 ${isCategoriasOpen ? "max-h-screen" : "max-h-0"}`}
            >

                {categorias.map((categoria) => (
                    <li key={categoria.cat_id} className="mb-3">
                        <Link
                            to={`/productos/${categoria.cat_nombre}`}
                            className="block text-gray-700 hover:bg-[#0D6E6E] hover:text-white transition-colors duration-300 py-2 px-4 rounded-lg"
                        >
                            {categoria.cat_nombre}
                        </Link>
                    </li>
                ))}
            </ul>

            {/* Marcas */}
            <h2
                onClick={toggleMarcas}
                className="text-xl font-bold text-gray-800 mt-6 mb-4 border-b pb-2 cursor-pointer flex justify-between items-center"
            >
                Marcas
                <span className={`transform transition-transform ${isMarcasOpen ? "rotate-180" : "rotate-0"}`}>
                    <FaArrowDownWideShort />
                </span>
            </h2>
            <ul
                className={`overflow-hidden transition-all duration-300 ${isMarcasOpen ? "max-h-screen" : "max-h-0"}`}
            >
                {marcas.map((marca) => (
                    <li key={marca.marca_id} className="mb-3">
                        <Link
                            to={`/productos/marcas/${marca.marca_nombre}`}
                            className="block text-gray-700 hover:bg-[#0D6E6E] hover:text-white transition-colors duration-300 py-2 px-4 rounded-lg"
                        >
                            {marca.marca_nombre}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Sidebar;
