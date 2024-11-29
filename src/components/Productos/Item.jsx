import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart } from 'react-icons/fa';
import { CartContext } from '../Context/CartContext';
import { useNavigate } from 'react-router-dom';
import { AuthService } from "../../Cookies/AuthService";
import Swal from 'sweetalert2';

const Item = ({ producto }) => {
    const { addToCart, getProductQuantity } = useContext(CartContext);
    const cartQuantity = getProductQuantity(producto.cod_prod);
    const isAddDisabled = cartQuantity >= Math.min(producto.prod_stock, 5);
    const navigate = useNavigate(); 
    const [showNotification, setShowNotification] = useState(false); 

    // Agregar verificación de usuario logueado
    const isUserLoggedIn = () => !!AuthService.getUser();

    const handleAddToCart = () => {
        if (!isUserLoggedIn()) {
            Swal.fire({
                title: '¡Registrate!',
                text: 'Necesitas iniciar sesión para utilizar nuestro carrito',
                icon: 'warning',
                showCancelButton: true, 
                confirmButtonText: 'Ir al Login', 
                cancelButtonText: 'Cancelar', 
                reverseButtons: true, 
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate('/login'); 
                }
            });
            return;
        }
        if (!isAddDisabled) {
            addToCart(producto);
            setShowNotification(true); 
            setTimeout(() => setShowNotification(false), 5000); // Oculta la notificación después de 2 segundos
        }
    };

    return (
        <div className="border p-4 rounded-lg shadow-md transition-transform transform hover:scale-105 hover:shadow-[#0D1F2D] m-4">
            {showNotification && (
                <Link to='/carrito' className="absolute top-0 right-0 mt-2 mr-2 bg-green-500 text-white px-4 py-2 rounded shadow">
                    ¡Listo producto agregado al carrito! 
                    Click aquí para seguir con la compra
                </Link>
            )}
            <Link to={`/products/${producto.cod_prod}`} className="block mb-4">
                <img src={producto.url_imagen} alt={producto.prod_nombre} className="w-full h-48 object-contain"/>
                <h4 className="text-lg font-semibold">{producto.prod_nombre}</h4>
            </Link>
            <p className="text-2xl text-[#FF3D3D] font-bold mb-2">
                ${parseFloat(producto.prod_precio).toLocaleString('es-AR', {
                    minimumFractionDigits: 0,
                })}
            </p>
            <div className="flex justify-between items-center mt-4">
                <Link to={`/products/${producto.cod_prod}`}
                    className="bg-[#0D6E6E] text-white px-4 py-2 rounded-full hover:bg-[#4a9d9c] transition-all duration-300">
                    Ver más
                </Link>
                <button onClick={handleAddToCart} disabled={isAddDisabled}
                    className={`px-4 py-2 rounded-full transition-all duration-300 flex items-center justify-center ${isAddDisabled
                            ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                            : "bg-[#0D1F2D] text-white hover:bg-[#354656]"
                        }`}>
                    <FaShoppingCart size={20}/>
                </button>
            </div>
        </div>
    );
};

export default Item;
