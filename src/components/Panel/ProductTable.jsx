import React, { useState } from 'react';
import { AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai';
import Swal from 'sweetalert2';
import { AuthService } from '../../Cookies/AuthService';

const ProductTable = ({ products, onEdit, onDelete, loadProducts, onManageImages }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('asc'); 
    const [showFeatured, setShowFeatured] = useState(false); 
    const user = AuthService.getUserRole()

    // Filtrar productos
    const filteredProducts = products.filter(product => {
        const lowercasedTerm = searchTerm.toLowerCase();
        return (
            product.prod_nombre.toLowerCase().includes(lowercasedTerm) ||
            product.cod_prod.toString().includes(lowercasedTerm)
        );
    });

    // Ordenar productos por precio
    const sortedProducts = filteredProducts.sort((a, b) => {
        const priceA = parseFloat(a.prod_precio);
        const priceB = parseFloat(b.prod_precio);

        return sortOrder === 'asc' ? priceA - priceB : priceB - priceA;
    });

    const handleToggleHabilitar = async (product) => {
        const newHabilitarValue = !product.habilitar;
        try {
            const response = await fetch(`http://localhost:3000/products/habilitar`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ habilitar: newHabilitarValue, cod_prod: product.cod_prod, }),
            });

            if (response.ok) {
                Swal.fire('¡Éxito!', 'Estado del producto actualizado', 'success');
                loadProducts(); 
            } else {
                const errorData = await response.json();
                Swal.fire('Error', errorData.message, 'error');
            }
        } catch (error) {
            console.error('Error al cambiar estado del producto:', error);
            Swal.fire('Error', 'Error al actualizar el producto', 'error');
        }
    };

    return (
        <div className="overflow-x-auto p-4">
    {/* Barra de búsqueda y botones */}
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
        <input
            type="text"
            placeholder="Buscar producto por nombre o código"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 w-full md:w-1/2"
        />
        <div className="flex flex-col sm:flex-row gap-2">
            <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="bg-gray-200 hover:bg-gray-300 rounded-lg px-4 py-2 transition-colors"
            >
                Ordenar por precio: {sortOrder === 'asc' ? 'Ascendente' : 'Descendente'}
            </button>
            <button
                onClick={() => setShowFeatured(!showFeatured)}
                className={`rounded-lg px-4 py-2 transition-colors ${
                    showFeatured ? 'bg-[#0D6E6E] text-white' : 'bg-gray-200 hover:bg-gray-300'
                }`}
            >
                {showFeatured ? 'Mostrar Todos' : 'Mostrar Destacados'}
            </button>
        </div>
    </div>

    {/* Tabla de productos */}
    <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-lg">
        <thead className="bg-gray-100">
            <tr>
                <th className="px-6 py-3 text-left text-gray-600 font-semibold">Código</th>
                <th className="px-6 py-3 text-left text-gray-600 font-semibold">Producto</th>
                <th className="px-6 py-3 text-left text-gray-600 font-semibold">Precio</th>
                <th className="px-6 py-3 text-left text-gray-600 font-semibold">Acciones</th>
                <th className="px-6 py-3 text-left text-gray-600 font-semibold">Habilitar</th>
            </tr>
        </thead>
        <tbody>
            {sortedProducts
                .filter((product) => !showFeatured || product.prod_destacado)
                .map((product) => (
                    <tr key={product.cod_prod} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 border-b border-gray-200">{product.cod_prod}</td>
                        <td className="px-6 py-4 border-b border-gray-200">{product.prod_nombre}</td>
                        <td className="px-6 py-4 border-b border-gray-200">
                            ${parseFloat(product.prod_precio).toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                        </td>
                        <td className="px-6 py-4 border-b border-gray-200">
                            <div className="flex flex-col sm:flex-row gap-2">
                                <button
                                    onClick={() => onEdit(product)}
                                    className="flex items-center rounded-md px-2 py-2 bg-yellow-300 text-black font-semibold hover:text-blue-500"
                                >
                                    <AiOutlineEdit className="mr-1" />
                                    Editar
                                </button>
                                {user !== 'Operador' && (
                                    <button
                                        onClick={() => onDelete(product.cod_prod)}
                                        className="flex items-center rounded-md px-2 py-2 font-semibold bg-[#e0e0e0] text-red-600 hover:text-black"
                                    >
                                        <AiOutlineDelete className="mr-1" />
                                        Eliminar
                                    </button>
                                )}
                            </div>
                        </td>
                        <td className="px-6 py-4 border-b border-gray-200">
                            <button
                                onClick={() => handleToggleHabilitar(product)}
                                className={`px-4 py-2 rounded ${
                                    product.habilitar ? 'bg-red-500 hover:bg-red-700 text-white' : 'bg-green-500 text-white'
                                }`}
                            >
                                {product.habilitar ? 'Deshabilitar' : 'Habilitar'}
                            </button>
                        </td>
                    </tr>
                ))}
        </tbody>
    </table>
</div>

    );
};

export default ProductTable;
