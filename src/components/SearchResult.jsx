import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const SearchResults = () => {
    const location = useLocation();
    const [products, setProducts] = useState([]);
    const searchQuery = location.state?.searchQuery || '';

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(`http://localhost:3000/products/search?q=${searchQuery}`);
                const data = await response.json();
                setProducts(data);
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };

        if (searchQuery) {
            fetchProducts();
        }
    }, [searchQuery]);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-4">Resultados de Búsqueda</h1>
            {products.length === 0 ? (
                <p>No se encontraron productos que coincidan con su búsqueda.</p>
            ) : (
                <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products
                    .filter((product) => product.habilitar) 
                    .map((product) => ( 
                        <li key={product.cod_prod} className="border p-4 rounded-lg shadow-md transition-transform transform hover:scale-105 hover:shadow-xl">
                            <div> 
                                <img src={product.url_imagen} alt={product.prod_nombre} className="w-full h-48 object-contain mb-4" />
                                <h3 className="text-lg font-semibold">{product.prod_nombre}</h3>
                                <p className="text-2xl text-red-600 font-bold mb-2">${parseFloat(product.prod_precio).toLocaleString('es-AR', {
                                    minimumFractionDigits: 0,
                                })}</p>
                                <div className="flex justify-between items-center mt-4">
                                    <Link to={`/products/${product.cod_prod}`} className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-all duration-300">
                                        Ver Más
                                    </Link>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SearchResults;
