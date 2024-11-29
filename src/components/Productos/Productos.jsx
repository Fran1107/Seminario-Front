import React, { useEffect, useState } from 'react';
import Item from './Item';
import { Link, useNavigate } from 'react-router-dom';
import { AuthService } from '../../Cookies/AuthService';
import Swal from 'sweetalert2';
import Sidebar from './Sidebar';

const Productos = ({ products, titulo }) => {
    const [categorias, setCategorias] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState(products);
    const navigate = useNavigate()
    const [filter, setFilter] = useState('');
    const [marcas, setMarcas] = useState([]);
    const [minPrice, setMinPrice] = useState(''); 
    const [maxPrice, setMaxPrice] = useState(''); 
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [popupType, setPopupType] = useState(''); 

    useEffect(() => {
        const loggedUser = AuthService.getUser();
        if (loggedUser && loggedUser.cli_cuil < 10000000) {
            navigate('/EditarPerfil')
            Swal.fire('¡BIENVENIDO!', 'COMPLETA TUS DATOS PARA SEGUIR NAVEGANDO POR FAVOR', 'warning');
        }
    }, []);

    // Cargar marcas
    const loadMarcas = async () => {
        const response = await fetch("http://localhost:3000/marcas", {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        setMarcas(data);
    };

    useEffect(() => {
        loadMarcas();
    }, []);

    // Cargar categorias
    const loadCategorias = async () => {
        const response = await fetch("http://localhost:3000/categorias", {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        setCategorias(data);
    };

    useEffect(() => {
        loadCategorias();
    }, []);

    useEffect(() => {
        handleFilterChange(filter);
    }, [filter, products]);

    const handleFilterChange = (selectedFilter) => {
        let sortedProducts = [...products];
        if (selectedFilter === 'precio-asc') {
            sortedProducts.sort((a, b) => a.prod_precio - b.prod_precio);
        } else if (selectedFilter === 'precio-desc') {
            sortedProducts.sort((a, b) => b.prod_precio - a.prod_precio);
        } else if (selectedFilter === 'destacados') {
            sortedProducts = sortedProducts.filter(prod => prod.prod_destacado);
        } else {
            sortedProducts = products;
        }
        setFilteredProducts(sortedProducts);
    }

    const handleMarcaFilter = (marcaNombre) => {
        if (marcaNombre == 'Todas') {
            setFilteredProducts(products);
        } else {
            const filteredByMarca = products.filter((prod) => prod.marca_nombre == marcaNombre);
            setFilteredProducts(filteredByMarca);
        }
    };

    // Filtro por rango de precios
    const handlePriceFilter = () => {
        const min = parseFloat(minPrice) || 0;
        const max = parseFloat(maxPrice) || Infinity;

        const filteredByPrice = products.filter(
            (prod) => prod.prod_precio >= min && prod.prod_precio <= max
        );
        setFilteredProducts(filteredByPrice);
    };

    // Filtrar productos
    const handleFilter = (type, value) => {
        setFilteredProducts(
            products.filter((prod) => prod[type] === value)
        );
        setIsPopupOpen(false); 
    };

    return (
        <div>
            <div className="flex">
                <Sidebar categorias={categorias} marcas={marcas} />

                <div className="w-full md:w-3/4 p-4">
                    <h1 className="text-2xl font-bold mb-6">{titulo}</h1>

                    {/* Filtros */}
                    <div className="mb-4 flex flex-wrap gap-4 items-center">
                        <div>
                            <label htmlFor="filtro">Ordenar por:</label>
                            <select
                                id="filtro"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="border rounded px-2 py-1"
                            >
                                <option value="">Todos</option>
                                <option value="precio-asc">Precio: Menor a Mayor</option>
                                <option value="precio-desc">Precio: Mayor a Menor</option>
                            </select>
                        </div>
                        {/* Filtro por rango de precios */}
                    <div className="flex items-center gap-2">
                        <label htmlFor="minPrice" className="">Precio:</label>
                        <input
                            id="minPrice"
                            type="text"
                            placeholder="Mínimo"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            className="border rounded px-2 py-1 w-20"
                        />
                        <span>-</span>
                        <label htmlFor="maxPrice" className="sr-only mr-4">Precio máximo:</label>
                        <input
                            id="maxPrice"
                            type="text"
                            placeholder="Máximo"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            className="border rounded px-2 py-1 w-20"
                        />
                        <button
                            onClick={handlePriceFilter}
                            className="bg-[#0D6E6E] hover:bg-[#4a9d9c] text-white rounded px-4 py-1"
                        >
                            Aplicar
                        </button>
                    </div>
                    </div>

                    {/* Botones de categorías y marcas para pantallas pequeñas */}
                    <div className="block md:hidden mb-4 flex gap-4">
                        <button
                            onClick={() => {
                                setPopupType('categorias');
                                setIsPopupOpen(true);
                            }}
                            className="bg-[#0D6E6E] text-white px-4 py-2 rounded"
                        >
                            Categorías
                        </button>
                        <button
                            onClick={() => {
                                setPopupType('marcas');
                                setIsPopupOpen(true);
                            }}
                            className="bg-[#0D6E6E] text-white px-4 py-2 rounded"
                        >
                            Marcas
                        </button>
                    </div>

                    {/* Productos */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {filteredProducts
                        .filter((prod) => prod.habilitar) 
                        .map((prod) => (
                            <Item producto={prod} key={prod.cod_prod} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Popup */}
            {isPopupOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-4 rounded shadow-lg w-3/4 max-w-lg">
                        <h2 className="text-xl font-bold mb-4">
                            {popupType === 'categorias' ? 'Categorías' : 'Marcas'}
                        </h2>
                        <ul className="max-h-64 overflow-y-auto">
                            {(popupType === 'categorias' ? categorias : marcas).map((item) => (
                                <li
                                    key={item.cat_id || item.marca_id}
                                    className="mb-2"
                                >
                                    <button
                                        onClick={() =>
                                            handleFilter(
                                                popupType === 'categorias'
                                                    ? 'categoria'
                                                    : 'marca',
                                                item.cat_nombre || item.marca_nombre
                                            )
                                        }
                                        className="text-[#0D6E6E] hover:underline"
                                    >
                                        {item.cat_nombre || item.marca_nombre}
                                    </button>
                                </li>
                            ))}
                        </ul>
                        <button
                            onClick={() => setIsPopupOpen(false)}
                            className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Productos;
