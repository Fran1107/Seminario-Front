import React, { useEffect, useState } from 'react';
import { AiOutlineArrowLeft } from 'react-icons/ai';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

const Marcas = () => {
    const [marcas, setMarcas] = useState([]);
    const [newMarca, setNewMarca] = useState({ nombre: "", logo: "" });
    const [error, setError] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Cargar marcas desde el servidor
    const loadMarcas = async () => {
        try {
            const response = await fetch("http://localhost:3000/marcas", {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();
            setMarcas(data);
        } catch (error) {
            console.error("Error al cargar marcas:", error);
            setError("No se pudo cargar las marcas");
        }
    };

    // Crear una nueva marca
    const createMarca = async (e) => {
        e.preventDefault();
        const trimmedNombre = newMarca.nombre.trim();

        if (!trimmedNombre) {
            return setError("El nombre de la marca no puede estar vacío");
        }

        // Verificar si la marca ya existe
        const marcaExistente = marcas.some(
            (marca) => marca.marca_nombre.toLowerCase() === trimmedNombre.toLowerCase()
        );

        if (marcaExistente) {
            return setError("La marca ya existe");
        }

        try {
            const response = await fetch("http://localhost:3000/marcas/create", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ marca_nombre: trimmedNombre, logo_url: newMarca.logo })
            });
            console.log('res', response)

            if (response.ok) {
                Swal.fire('¡Éxito!', 'Marca creada exitosamente', 'success');
                loadMarcas(); 
                setNewMarca({ nombre: "", logo: "" }); 
                setError("");
            } else {
                setError("Error al crear la marca");
            }
        } catch (error) {
            console.error("Error al crear marca:", error);
            setError("No se pudo crear la marca");
        }
    };

    useEffect(() => {
        loadMarcas();
    }, []);

    return (
        <div className="p-6 bg-gray-50 shadow-lg rounded-lg border border-gray-200 max-w-2xl mx-auto">
            <Link to="/admin" className="inline-flex items-center mb-4 px-4 py-2 bg-[#0D6E6E] text-white rounded-lg shadow-lg hover:bg-[#4a9d9c] transition-all">
                <AiOutlineArrowLeft className="mr-2 text-xl" />
                Volver al Panel Principal
            </Link>

            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">Panel de Marcas</h2>

            {/* Formulario para crear una nueva marca */}
            <form onSubmit={createMarca} className="mb-6">
                <label className="block text-gray-700 mb-1" htmlFor="nombre">
                    Nueva Marca
                </label>
                <input
                    type="text"
                    id="nombre"
                    value={newMarca.nombre}
                    onChange={(e) => setNewMarca({ ...newMarca, nombre: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md text-gray-800 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ingrese el nombre de la marca"
                />
                <label className="block text-gray-700 mb-1" htmlFor="logo">
                    URL del Logo
                </label>
                <input
                    type="text"
                    id="logo"
                    value={newMarca.logo}
                    onChange={(e) => setNewMarca({ ...newMarca, logo: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md text-gray-800 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ingrese la URL del logo"
                />
                <button
                    type="submit"
                    className="w-full py-2 bg-[#0D6E6E] text-white rounded-md hover:bg-[#4a9d9c] transition-all"
                >
                    Crear Marca
                </button>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </form>

            {/* Botón para abrir modal */}
            <button
                onClick={() => setIsModalOpen(true)}
                className="w-full py-2 mb-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-all"
            >
                Ver todas las marcas
            </button>

            {/* Modal de marcas */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full h-3/4 overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-gray-800">Listado de Marcas</h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-500 hover:text-gray-800 transition-all"
                            >
                                Cerrar
                            </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {marcas.map((marca) => (
                                <div
                                    key={marca.marca_id}
                                    className="p-3 bg-gray-100 rounded-md text-gray-800 shadow-sm border border-gray-200 text-center"
                                >
                                    <p>{marca.marca_nombre}</p>
                                    {marca.logo_url && <img src={marca.logo_url} alt={`${marca.marca_nombre} logo`} className="w-full h-16 object-contain mt-2" />}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Marcas;
