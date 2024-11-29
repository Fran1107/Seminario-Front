import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const EspecificacionModal = ({ product, isOpen, onClose }) => {
    const [especificaciones, setEspecificaciones] = useState([]);
    const [newEspecificacion, setNewEspecificacion] = useState({
        esp_titulo: '',
        nombres: [{ nombre_titulo: '', nombre_descripcion: '' }],
    });

    // Fetch de especificaciones al abrir el modal
    useEffect(() => {
        if (isOpen && product.cod_prod) {
            const fetchEspecificaciones = async () => {
                try {
                    const response = await fetch(
                        `http://localhost:3000/especificacion/getEspecificacion/${product.cod_prod}`
                    );
                    const data = await response.json();
                    setEspecificaciones(data || []);
                } catch (error) {
                    console.error('Error al obtener especificaciones:', error);
                    Swal.fire('Error', 'No se pudieron cargar las especificaciones', 'error');
                }
            };
            fetchEspecificaciones();
        }
    }, [isOpen, product]);

    const handleAddEspecificacion = async () => {
        try {
            const response = await fetch('http://localhost:3000/especificacion/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newEspecificacion,
                    cod_prod: product.cod_prod,
                }),
            });

            if (response.ok) {
                Swal.fire('Éxito', 'Especificación agregada correctamente', 'success').then(() => {
                    window.location.reload()
                });
                const addedEspecificacion = await response.json();
                setEspecificaciones([...especificaciones, addedEspecificacion.especificacion]);
                setNewEspecificacion({ esp_titulo: '', nombres: [{ nombre_titulo: '', nombre_descripcion: '' }] });
            } else {
                const errorData = await response.json();
                Swal.fire('Error', errorData.error || 'Error al agregar especificación', 'error');
            }
        } catch (error) {
            console.error('Error al agregar especificación:', error);
            Swal.fire('Error', 'No se pudo agregar la especificación', 'error');
        }
        
    };

    const handleInputChange = (e, index, field) => {
        const updatedNombres = [...newEspecificacion.nombres];
        updatedNombres[index][field] = e.target.value;
        setNewEspecificacion({ ...newEspecificacion, nombres: updatedNombres });
    };

    const addNombreField = () => {
        setNewEspecificacion({
            ...newEspecificacion,
            nombres: [...newEspecificacion.nombres, { nombre_titulo: '', nombre_descripcion: '' }],
        });
    };

    const renderEspecificaciones = () => {
        return especificaciones.map((esp, index) => (
            <div key={esp.esp_id} className="border rounded p-2 my-2 flex justify-between items-center">
                <details>
                    <summary className="font-bold cursor-pointer">{esp.esp_titulo}</summary>
                    <ul className="mt-2">
                        {esp.nombres.map((nombre, i) => (
                            <li key={i} className="text-sm">
                                <strong>{nombre.nombre_titulo}:</strong> {nombre.nombre_descripcion}
                            </li>
                        ))}
                    </ul>
                </details>
                <button
                    onClick={() => handleDelete(esp.esp_id)}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                    Eliminar
                </button>
            </div>
            
        ));
    };

    const handleDelete = async (esp_id) => {
        
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "¡No podrás revertir esta acción!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar',
            reverseButtons: true,
        });
    
        if (result.isConfirmed) {
            try {
                const response = await fetch(`http://localhost:3000/especificacion/delete/${esp_id}`, {
                    method: 'DELETE',
                });
    
                const data = await response.json();
    
                if (data.status === 'success') {
                    Swal.fire({
                        icon: 'success',
                        title: 'Especificación eliminada',
                        text: 'La especificación se ha eliminado correctamente.',
                    });
    
                    // Actualizar las especificaciones después de eliminar una
                    setEspecificaciones((prevEspecificaciones) =>
                        prevEspecificaciones.filter((esp) => esp.esp_id !== esp_id)
                    );
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Hubo un problema al eliminar la especificación.',
                    });
                }
            } catch (error) {
                console.error('Error al eliminar especificación:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Hubo un error al intentar eliminar la especificación.',
                });
            }
        } else {
            console.log('Eliminación cancelada');
        }
    };
    

    return isOpen ? (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-2xl p-6 rounded shadow-lg relative">
                <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-black"
                    onClick={onClose}
                >
                    ✕
                </button>
                <h2 className="text-xl font-bold mb-4">Especificaciones del Producto</h2>

                {/* Lista de especificaciones */}
                <div>{renderEspecificaciones()}</div>

                {/* Formulario para agregar nueva especificación */}
                <div className="mt-6 border-t pt-4">
                    <h3 className="text-lg font-semibold mb-2">Agregar Nueva Especificación</h3>
                    <input
                        type="text"
                        placeholder="Título de la Especificación"
                        value={newEspecificacion.esp_titulo}
                        onChange={(e) => setNewEspecificacion({ ...newEspecificacion, esp_titulo: e.target.value })}
                        className="w-full border p-2 rounded mb-2"
                    />
                    {newEspecificacion.nombres.map((nombre, index) => (
                        <div key={index} className="flex space-x-2 mb-2">
                            <input
                                type="text"
                                placeholder="Nombre del Título"
                                value={nombre.nombre_titulo}
                                onChange={(e) => handleInputChange(e, index, 'nombre_titulo')}
                                className="flex-1 border p-2 rounded"
                            />
                            <input
                                type="text"
                                placeholder="Descripción"
                                value={nombre.nombre_descripcion}
                                onChange={(e) => handleInputChange(e, index, 'nombre_descripcion')}
                                className="flex-1 border p-2 rounded"
                            />
                        </div>
                    ))}
                    <div className="flex flex-wrap gap-2 justify-start sm:justify-center md:justify-end">
                        <button
                            onClick={addNombreField}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm sm:text-base"
                        >
                            + Agregar más campos
                        </button>
                        <button
                            onClick={handleAddEspecificacion}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm sm:text-base"
                        >
                            Guardar Especificación
                        </button>
                    </div>

                </div>
            </div>
        </div>
    ) : null;
};

export default EspecificacionModal;
