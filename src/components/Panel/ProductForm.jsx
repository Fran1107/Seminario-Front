import React, { useState, useEffect } from 'react';
import ImageManagerModal from './ImageManagerModal'; 
import Swal from 'sweetalert2';
import EspecificacionModal from './EspecificacionModal';

const ProductForm = ({ product, loadProducts, closeModal }) => {
    const [formData, setFormData] = useState({
        cod_prod: '',
        prod_nombre: '',
        prod_precio: '',
        prod_stock: '',
        prod_descripcion: '',
        cat_id: '',
        marca_id: '',
        prod_destacado: false,
    });
    const [categorias, setCategorias] = useState([]);
    const [marcas, setMarcas] = useState([]);
    const [isEditMode, setIsEditMode] = useState(false); 
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [isEspecificacionModalOpen, setIsEspecificacionModalOpen] = useState(false); 

    useEffect(() => {
        if (product && product.cod_prod) {
            setFormData({
                ...product,
                prod_destacado: product.prod_destacado || false,
            });
            setIsEditMode(true); 
        } else {
            setFormData({
                cod_prod: '',
                prod_nombre: '',
                prod_precio: '',
                prod_stock: '',
                prod_descripcion: '',
                cat_id: '',
                marca_id: '',
                prod_destacado: false,
            });
            setIsEditMode(false); 
        }
    }, [product]);

    useEffect(() => {
        const fetchCategorias = async () => {
            const response = await fetch('http://localhost:3000/categorias');
            const data = await response.json();
            setCategorias(data);
        };

        const fetchMarcas = async () => {
            const response = await fetch('http://localhost:3000/marcas');
            const data = await response.json();
            setMarcas(data);
        };

        fetchCategorias();
        fetchMarcas();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type == 'checkbox' ? checked : value,
        });
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        const { categoria, marca, ...dataToSubmit } = formData;
        dataToSubmit.prod_precio = parseFloat(dataToSubmit.prod_precio);
        dataToSubmit.prod_stock = parseInt(dataToSubmit.prod_stock, 10);

        try {
            const response = await fetch('http://localhost:3000/products/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSubmit),
            });

            if (response.ok) {
                Swal.fire('¡Éxito!', 'Producto creado exitosamente', 'success');

                loadProducts();
                closeModal();
            } else {
                const errorData = await response.json();
                console.error('Error al crear el producto:', errorData);
                Swal.fire('Error', 'Error al crear el producto: ' + (errorData.message || 'Error desconocido'), 'error');
            }
        } catch (error) {
            console.error('Error al crear el producto:', error);
            Swal.fire('Error', 'Error al crear el producto', 'error');
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        const { categoria, marca, url_imagen, ...dataToSubmit } = formData;
        dataToSubmit.prod_precio = parseFloat(dataToSubmit.prod_precio);
        dataToSubmit.prod_stock = parseInt(dataToSubmit.prod_stock, 10);

        try {
            const response = await fetch(`http://localhost:3000/products/update/${formData.cod_prod}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSubmit),
            });

            if (response.ok) { 
                Swal.fire('¡Éxito!', 'Producto actualizado exitosamente', 'success');
                loadProducts();
                closeModal();
            } else {
                const errorData = await response.json();
                console.error('Error al actualizar el producto:', errorData);
                Swal.fire('Error', 'Error al actualizar el producto: ' + (errorData.message || 'Error desconocido'), 'error');
            }
        } catch (error) {
            console.error('Error al actualizar el producto:', error);
            Swal.fire('Error', 'Error al actualizar el producto', 'error');
        }
    };
    

    return (
        <>

            <form onSubmit={isEditMode ? handleUpdate : handleCreate} className="space-y-4 max-w-2xl mx-auto">
                <input
                    type="text"
                    name="cod_prod"
                    placeholder="Código del Producto"
                    value={formData.cod_prod}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    disabled={isEditMode} // Desactiva el campo en modo edición
                />
                <input
                    type="text"
                    name="prod_nombre"
                    placeholder="Nombre del Producto"
                    value={formData.prod_nombre}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                />
                <input
                    type="text"
                    name="prod_precio"
                    placeholder="Precio del Producto"
                    value={formData.prod_precio}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                />
                <textarea
                    name="prod_descripcion"
                    placeholder="Descripción del Producto"
                    value={formData.prod_descripcion}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                ></textarea>
                <input
                    type="number"
                    name="prod_stock"
                    placeholder="Stock del Producto"
                    value={formData.prod_stock}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                />

                <select
                    name="cat_id"
                    value={formData.cat_id}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                >
                    <option value="">Seleccione una Categoría</option>
                    {categorias.map((categoria) => (
                        <option key={categoria.cat_id} value={categoria.cat_id}>
                            {categoria.cat_nombre}
                        </option>
                    ))}
                </select>

                <select
                    name="marca_id" 
                    value={formData.marca_id}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                >
                    <option value="">Seleccione una Marca</option>
                    {marcas.map((marca) => (
                        <option key={marca.marca_id} value={marca.marca_id}>
                            {marca.marca_nombre}
                        </option>
                    ))}
                </select>

                <label className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        name="prod_destacado"
                        checked={formData.prod_destacado}
                        onChange={handleChange}
                    />
                    <span>Producto Destacado</span>
                </label>
                <div className="flex justify-between space-x-4 mt-6">

                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        {isEditMode ? 'Actualizar Producto' : 'Crear Producto'}
                    </button>
                    

                    {/* Botón para abrir el modal de gestión de imágenes */}
                    {isEditMode && (
                        <button
                            type="button"
                            onClick={() => setIsImageModalOpen(true)}
                            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                        >
                            Gestionar Imágenes
                        </button>
                    )}

                    {/* Botón para abrir el modal de especificaciones */}
                    {isEditMode && (
                        <button
                            type="button"
                            onClick={() => setIsEspecificacionModalOpen(true)}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                            Descripcion
                        </button>
                    )}
                </div>
            </form>

            {/* Modal de gestión de imágenes */}
            {product && (
                <ImageManagerModal
                    product={product}
                    isOpen={isImageModalOpen}
                    onClose={() => setIsImageModalOpen(false)}
                />
            )}

            {/* Modal de especificaciones del producto */}
            {product && (
                <EspecificacionModal
                    product={product}
                    isOpen={isEspecificacionModalOpen}
                    onClose={() => setIsEspecificacionModalOpen(false)}
                />
            )}
        </>
    );
};

export default ProductForm;
