import React, { useEffect, useState } from 'react';
import ProductForm from './ProductForm';
import ProductTable from './ProductTable';
import { AiOutlineArrowLeft } from 'react-icons/ai';
import { Link } from 'react-router-dom';
import ImageManagerModal from './ImageManagerModal';
import { AuthService } from '../../Cookies/AuthService';

const ManageProducts = () => {
    const [products, setProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 15;

    const [editingProduct, setEditingProduct] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [isSuccessPopupVisible, setIsSuccessPopupVisible] = useState(false);

    const loggedUser = AuthService.getUserRole()

    const loadProducts = async () => {
        const response = await fetch('http://localhost:3000/products');
        const data = await response.json();
        setProducts(data);
    };

    useEffect(() => {
        loadProducts();
    }, []);

    const handleEdit = (product) => {
        setEditingProduct(product);
        setIsEditModalOpen(true);
    };

    const confirmDelete = (productId) => {
        setProductToDelete(productId);
        setIsConfirmDeleteOpen(true);
    };

    const handleDelete = async () => {
        await fetch(`http://localhost:3000/products/delete/${productToDelete}`, { method: 'DELETE' });
        loadProducts();
        setIsConfirmDeleteOpen(false);
        setProductToDelete(null);
        setIsSuccessPopupVisible(true); 
        setTimeout(() => {
            setIsSuccessPopupVisible(false); // Oculta el popup después de 2 segundos
        }, 2000);
    };

    const openCreateModal = () => {
        setEditingProduct(null); 
        setIsCreateModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setEditingProduct(null); 
    };

    const closeCreateModal = () => {
        setIsCreateModalOpen(false);
    };

    const handleManageImages = (product) => {
        setCurrentProduct(product);
        setIsImageModalOpen(true); 
    };

    const closeImageModal = () => {
        setIsImageModalOpen(false);
        setCurrentProduct(null);
    };

    const closeConfirmDeleteModal = () => {
        setIsConfirmDeleteOpen(false);
        setProductToDelete(null);
    };

    // Calcula los productos a mostrar en la página actual
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

    // Cambia de página
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                <h1 className="text-3xl md:text-4xl font-semibold text-gray-800 text-center md:text-left">
                    Gestión de Productos
                </h1>
                {loggedUser === "Operador" ? (
                    <Link
                        to="/operador"
                        className="flex items-center px-4 py-2 bg-[#0D6E6E] text-white rounded-lg shadow-lg hover:bg-[#4a9d9c] transition-all"
                    >
                        <AiOutlineArrowLeft className="mr-2 text-xl" />
                        Ir a Panel Operador
                    </Link>
                ) : loggedUser === "Admin" ? (
                    <Link
                        to="/admin"
                        className="flex items-center px-4 py-2 bg-[#0D6E6E] text-white rounded-lg shadow-lg hover:bg-[#4a9d9c] transition-all"
                    >
                        <AiOutlineArrowLeft className="mr-2 text-xl" />
                        Volver al Panel Principal
                    </Link>
                ) : null}
            </div>

            {/* Botón Crear Producto */}
            <div className="flex justify-center md:justify-start">
                <button
                    onClick={openCreateModal}
                    className="px-6 py-3 mb-3 bg-[#0D6E6E] text-white rounded-lg shadow-lg hover:bg-[#4a9d9c] transition-all"
                >
                    Crear Producto
                </button>
            </div>
            <ProductTable products={currentProducts} loadProducts={loadProducts} onEdit={handleEdit} onDelete={confirmDelete} onManageImages={handleManageImages} />

            {/* Paginación */}
            <div className="flex justify-center space-x-2 mt-4">
                {Array.from({ length: Math.ceil(products.length / productsPerPage) }).map((_, index) => (
                    <button
                        key={index}
                        onClick={() => paginate(index + 1)}
                        className={`px-3 py-1 rounded ${index + 1 === currentPage ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>

            {/* Modal para Crear Producto */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-96">
                        <h2 className="text-2xl mb-4">Crear Producto</h2>
                        <ProductForm loadProducts={loadProducts} closeModal={closeCreateModal} />
                        <button onClick={closeCreateModal} className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Cerrar</button>
                    </div>
                </div>
            )}

            {/* Modal para Editar Producto */}
            {isEditModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-96">
                        <h2 className="text-2xl mb-4">Editar Producto</h2>
                        <ProductForm product={editingProduct} loadProducts={loadProducts} closeModal={closeEditModal} />
                        <button onClick={closeEditModal} className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 block mx-auto">Cerrar</button>
                    </div>
                </div>
            )}

            {/* Modal para Confirmar Eliminación */}
            {isConfirmDeleteOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-96">
                        <h2 className="text-xl mb-4">¿Estás seguro de eliminar este producto?</h2>
                        <div className="flex justify-end">
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 mr-2"
                            >
                                Confirmar
                            </button>
                            <button
                                onClick={closeConfirmDeleteModal}
                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Popup de Éxito */}
            {isSuccessPopupVisible && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-green-500 p-4 rounded shadow-lg text-white">
                        Producto eliminado correctamente.
                    </div>
                </div>
            )}

            {/* Modal para manejar imágenes */}
            <ImageManagerModal
                product={currentProduct}
                isOpen={isImageModalOpen}
                onClose={closeImageModal}
            />
        </div>
    );
};

export default ManageProducts;
