import React, { useEffect, useState } from 'react';
import { AiOutlineArrowLeft } from 'react-icons/ai';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

const Categorias = () => {
    const [categorias, setCategorias] = useState([]);
    const [newCategoria, setNewCategoria] = useState({ nombre: "", url: "" });
    const [error, setError] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Cargar categorías desde el servidor
    const loadCategorias = async () => {
        try {
            const response = await fetch("http://localhost:3000/categorias", {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await response.json();
            setCategorias(data);
        } catch (error) {
            console.error("Error al cargar categorías:", error);
            setError("No se pudo cargar las categorías");
        }
    };

    // Crear una nueva categoría
    const createCategoria = async (e) => {
        e.preventDefault();
        const trimmedNombre = newCategoria.nombre.trim();
        const trimmedUrl = newCategoria.url.trim();

        if (!trimmedNombre) {
            return setError("El nombre de la categoría no puede estar vacío");
        }

        // Verificar si la categoría ya existe
        const categoriaExistente = categorias.some(
            (categoria) => categoria.cat_nombre.toLowerCase() === trimmedNombre.toLowerCase()
        );

        if (categoriaExistente) {
            return setError("La categoría ya existe");
        }

        try {
            const response = await fetch("http://localhost:3000/categorias/create", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cat_nombre: trimmedNombre, url: trimmedUrl }),
            });

            if (response.ok) {
                Swal.fire('¡Éxito!', 'Categoría creada exitosamente', 'success');
                loadCategorias(); 
                setNewCategoria({ nombre: "", url: "" }); 
                setError("");
            } else {
                setError("Error al crear la categoría");
            }
        } catch (error) {
            console.error("Error al crear categoría:", error);
            setError("No se pudo crear la categoría");
        }
    };

    useEffect(() => {
        loadCategorias();
    }, []);

    return (
        <div className="p-6 bg-gray-50 shadow-lg rounded-lg border border-gray-200 max-w-2xl mx-auto">
            <Link to="/admin" className="inline-flex items-center mb-4 px-4 py-2 bg-[#0D6E6E] text-white rounded-lg shadow-lg hover:bg-[#4a9d9c] transition-all">
                <AiOutlineArrowLeft className="mr-2 text-xl" />
                Volver al Panel Principal
            </Link>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">Panel de Categorías</h2>
            
            {/* Formulario para crear una nueva categoría */}
            <form onSubmit={createCategoria} className="mb-6">
                <label className="block text-gray-700 mb-1" htmlFor="nombre">
                    Nueva Categoría
                </label>
                <input
                    type="text"
                    id="nombre"
                    value={newCategoria.nombre}
                    onChange={(e) => setNewCategoria({ ...newCategoria, nombre: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md text-gray-800 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ingrese el nombre de la categoría"
                />
                <label className="block text-gray-700 mb-1" htmlFor="url">
                    URL de la Categoría
                </label>
                <input
                    type="text"
                    id="url"
                    value={newCategoria.url}
                    onChange={(e) => setNewCategoria({ ...newCategoria, url: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md text-gray-800 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ingrese la URL de la categoría"
                />
                <button
                    type="submit"
                    className="w-full py-2 bg-[#0D6E6E] text-white rounded-md hover:bg-[#4a9d9c] transition-all"
                >
                    Crear Categoría
                </button>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </form>

            {/* Botón para abrir modal */}
            <button
                onClick={() => setIsModalOpen(true)}
                className="w-full py-2 mb-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-all"
            >
                Ver todas las categorías
            </button>

            {/* Modal de categorías */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full h-3/4 overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-gray-800">Listado de Categorías</h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-500 hover:text-gray-800 transition-all"
                            >
                                Cerrar
                            </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {categorias.map((categoria) => (
                                <div
                                    key={categoria.cat_id}
                                    className="p-3 bg-gray-100 rounded-md text-gray-800 shadow-sm border border-gray-200 text-center"
                                >
                                    <p>{categoria.cat_nombre}</p>
                                    {categoria.url && (
                                        <img src={categoria.url} alt={`${categoria.cat_nombre} logo`} className="w-full h-16 object-contain mt-2" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Categorias;
