import React, { useContext, useEffect, useState } from 'react';
import { CartContext } from '../Context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrashAlt, FaPlusCircle, FaMinusCircle } from 'react-icons/fa';
import { AuthService } from '../../Cookies/AuthService';
import { HiOutlinePhone, HiOutlineUser } from 'react-icons/hi2';
import Swal from 'sweetalert2';

const Carrito = () => {
    const navigate = useNavigate()
    const { cartItems, removeFromCart, updateCartItemQuantity, address, setAddress, addresses, setAddresses, provinces, localidades, fetchLocalidades, costoEnvio, fetchCostoEnvio, clearCart } = useContext(CartContext);
    const [step, setStep] = useState(1);
    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedLocalidad, setSelectedLocalidad] = useState('');
    const [selectedPostalCode, setSelectedPostalCode] = useState("");
    const [metodosPago, setMetodosPago] = useState([]);
    const [selectedMetodo, setSelectedMetodo] = useState(null);
    const [user, setUser] = useState(null);
    const [missingData, setMissingData] = useState(false);
    const [ventaInfo, setVentaInfo] = useState(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showConfirmPopup, setShowConfirmPopup] = useState(false);
    const [productToRemove, setProductToRemove] = useState(null);

    const [newAddress, setNewAddress] = useState({
        calle: '',
        numero: '',
        piso: '',
        dpto: ''
    });
    // Agrega un estado para los mensajes de error
    const [error, setError] = useState(null);

    // Traer datos del usuario
    useEffect(() => {
        const loggedUser = AuthService.getUser();
        setUser(loggedUser);
    }, []);

    // Cambiar de paso
    const nextStep = () => {
        if (step === 2) {
            // Validación de datos antes de avanzar a pago
            if (!user || !user.nombre || !user.cli_apellido || !user.cli_dni || !user.cli_telefono || address.calle == 'Completar' || address.numero == 'Completar' || !selectedAddress || !selectedProvince || !selectedLocalidad) {
                setMissingData(true);
                return;
            }
        }
        setMissingData(false);
        setStep(step + 1);
    };
    const prevStep = () => setStep(step - 1);

    // Funciones para calcular subtotal y total
    const calculateSubtotal = (price, cantidad) => price * cantidad;
    const calculateTotal1 = () => {
        const subtotal = cartItems.reduce((total, item) => total + calculateSubtotal(item.prod_precio, item.cantidad), 0);
        return subtotal;
    };
    const calculateTotal = () => {
        const subtotal = cartItems.reduce((total, item) => total + calculateSubtotal(item.prod_precio, item.cantidad), 0);
        return subtotal + (parseFloat(costoEnvio) || 0);
    };

    // Cargar métodos de pago al montar el componente
    useEffect(() => {
        const loadMetodosPago = async () => {
            try {
                const response = await fetch("http://localhost:3000/metpago");
                const data = await response.json();
                setMetodosPago(data);
            } catch (error) {
                console.error("Error al cargar métodos de pago");
            }
        };
        loadMetodosPago();
    }, []);

    const handleProvinceChange = (event) => {
        const provId = event.target.value;
        setSelectedProvince(provId);
        fetchLocalidades(provId);
        fetchCostoEnvio(provId);
        setSelectedLocalidad('');
    };

    // Función para manejar el cambio de localidad
    const handleLocalidadChange = (e) => {
        const selectedCodPostal = e.target.value;
        const localidad = localidades.find((loc) => loc.local_codpostal === selectedCodPostal);

        setSelectedLocalidad(localidad ? localidad.local_nombre : "");
        setSelectedPostalCode(localidad ? localidad.local_codpostal : "");
    };

    const handleMetodoChange = (metodo) => setSelectedMetodo(metodo);

    const generarVenta = async () => {
        const total = calculateTotal();
        if (!selectedMetodo) {
            setError("Por favor, seleccione un método de pago o complete todos los datos de la tarjeta.");
            return;
        }

        // Validaciones para tarjeta de débito/crédito
        if (
            (selectedMetodo.descripcion == "Tarjeta de crédito" || selectedMetodo.descripcion == "Tarjeta de débito") &&
            (!cardNumber || !expirationDate || !cvv)
        ) {
            setError("Por favor, complete todos los datos de la tarjeta.");
            return;
        }

        setError(null);

        try {
            const response = await fetch('http://localhost:3000/ventas/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cli_cuil: user.cli_cuil,
                    venta_total: total,
                    cartItems,
                }),
            });
            if (response.ok) {
                const ventaReady = await response.json();
                setVentaInfo(ventaReady)
                generarPago(ventaReady.venta.nro_factura);
                generarEnvios(ventaReady.venta.nro_factura, address.domic_id || selectedAddress.domic_id, selectedPostalCode, costoEnvio)
                generarPedido(ventaReady.venta.nro_factura)

                clearCart()
                Swal.fire('¡Compra realizada!', 'Muchas gracias por confiar en nosotros!', 'success');

            } else {
                alert('Error al realizar venta :(')
            }
        } catch (error) {
            console.error("Error al crear una venta 1:", error);
        }

    }

    const enviarEmail = async (pedido_id) => {
        const total = calculateTotal()
        try {
            const email = await fetch('http://localhost:3000/ventas/sendEmail', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subject: `Datos de tu pedido nro: ${pedido_id}`,
                    text: `
                            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                                <h1 style="color: #4CAF50;">¡Felicitaciones ${user.nombre} ${user.cli_apellido}!</h1>
                                <p>La reserva del pedido <strong>nro: ${pedido_id}</strong> por un importe total de 
                                <strong>$${total}</strong> fue realizada con éxito.</p>
                                <p><strong>IMPORTANTE:</strong></p>
                                <p>Debes enviar un email a <a href="mailto:ejemplo@gmail.com" style="color: #4CAF50;">ejemplo@gmail.com</a> con el comprobante de pago.</p>
                                <h2>Datos para Transferencia Bancaria</h2>
                                <ul>
                                    <li><strong>CBU:</strong> 1234567890123456789012</li>
                                    <li><strong>Alias:</strong> BANCO.DEMO.CUENTA</li>
                                    <li><strong>Banco:</strong> Banco Simulado</li>
                                    <li><strong>Titular:</strong> Juan Pérez</li>
                                </ul>
                                <p>Para más detalles de tu pedido y descargar su factura, visita tu <a href="http://localhost:5173/profile" style="color: #4CAF50; text-decoration: underline;">perfil</a>.</p>
                                <p style="margin-top: 20px;">Gracias por elegirnos!</p>
                            </div>
                            `,
                }),
            })
        } catch (error) {
            console.error("Error al tratar de mandar email:", error);
        }
    }

    // Función para realizar el pago
    const generarPago = async (nro_factura) => {
        try {
            const response = await fetch('http://localhost:3000/pago', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    metpago_id: selectedMetodo?.metpago_id,
                    nro_factura: nro_factura,
                }),
            });

            if (response.ok) {
                const pagoReady = await response.json();
            } else {
                alert('Error al realizar el pago');
            }
        } catch (error) {
            console.error("Error al tratar de generar el pago:", error);
        }
    };

    //Funcion para crear la tabla envios
    const generarEnvios = async (nro_factura, domic_id, local_codpostal, costoEnvio) => {
        try {
            const response = await fetch('http://localhost:3000/envios/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    local_codpostal: local_codpostal,
                    nro_factura: nro_factura,
                    domic_id: domic_id,
                    costo: costoEnvio,
                }),
            });
            if (response.ok) {
                const enviosReady = await response.json();
                navigate('/profile')
            } else {
                alert('Error al realizar el pago');
            }
        } catch (error) {
            console.error("Error al tratar de generar el envioss:", error);
        }
    }

    const generarPedido = async (nro_factura) => {
        try {
            const response = await fetch('http://localhost:3000/pedido/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nro_factura: nro_factura,
                }),
            });
            if (response.ok) {
                const pedidoReady = await response.json();
                enviarEmail(pedidoReady.response.pedido_id)

            } else {
                alert('Error al realizar el pedido');
            }
        } catch (error) {
            console.error("Error al tratar de generar el pedido:", error);
        }
    }

    const generarDomic = async () => {
        try {
            const response = await fetch('http://localhost:3000/domicilio/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cli_cuil: user.cli_cuil,
                    calle: address.calle,
                    numero: address.numero,
                    piso: address.piso || null,
                    dpto: address.dpto || null,
                }),
            });
            if (response.ok) {
                const domic = await response.json();
                setAddresses([...addresses, domic]); // Agrega el nuevo domicilio al array
                setAddress(domic); // Actualiza el domicilio seleccionado 
                Swal.fire({
                    title: 'Domicilio Guardado!',
                    text: 'El domicilio se ha guardado correctamente.',
                    icon: 'success',
                    confirmButtonText: 'Aceptar'
                }).then(() => {
                    window.location.reload(); // Recarga la página después de que el usuario cierre el alert
                });  // Recarga la página
                setIsPopupOpen(false);  
            } else {
                alert('Error al crear domiciliosss');
            }
        } catch (error) {
            console.error("Error al tratar de crear el domicilio:", error);
        }
    }

    const handleRemoveClick = (cod_prod) => {
        setProductToRemove(cod_prod);
        setShowConfirmPopup(true);
    };

    const confirmRemove = () => {
        removeFromCart(productToRemove);
        setShowConfirmPopup(false);
        setProductToRemove(null);
    };

    const cancelRemove = () => {
        setShowConfirmPopup(false);
        setProductToRemove(null);
    };


    return (
        <div className="container mx-auto p-6 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Proceso de Compra</h1>

            {/* Línea de pasos */}
            <div className="flex justify-center mb-8 space-x-6">
                <span
                    className={`mx-4 text-2xl font-semibold transform transition-all duration-300 ease-in-out ${step === 1 ? "text-blue-500 scale-110 opacity-100" : "text-gray-500 opacity-70"
                        }`}
                >
                    Carrito
                </span>
                <span
                    className={`mx-4 text-2xl font-semibold transform transition-all duration-300 ease-in-out ${step === 2 ? "text-blue-500 scale-110 opacity-100" : "text-gray-500 opacity-70"
                        }`}
                >
                    Datos
                </span>
                <span
                    className={`mx-4 text-2xl font-semibold transform transition-all duration-300 ease-in-out ${step === 3 ? "text-blue-500 scale-110 opacity-100" : "text-gray-500 opacity-70"
                        }`}
                >
                    Pago
                </span>
            </div>

            {/* Paso 1: Carrito */}
            {step === 1 && (
                <div>
                    {cartItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 bg-white shadow-lg rounded-lg">
                            <p className="text-gray-500 text-lg font-medium mb-4">Tu carrito está vacío.</p>
                            <Link
                                to="/productos"
                                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition duration-300 ease-in-out transform hover:scale-105 shadow-md"
                            >
                                Seguir comprando
                            </Link>
                        </div>

                    ) : (
                        <div>
                            {cartItems.map((item) => (
                                <div key={item.cod_prod} className="bg-white shadow-md rounded-lg p-6 mb-6 flex items-center space-x-4">
                                    <img src={item.url_imagen} alt={item.prod_nombre} className="w-28 h-28 object-cover rounded-md" />
                                    <div className="flex-1">
                                        <h2 className="text-lg font-semibold">{item.prod_nombre}</h2>
                                        <p className="text-gray-600">Precio: ${item.prod_precio}</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => updateCartItemQuantity(item.cod_prod, item.cantidad - 1, item.prod_stock)}
                                            disabled={item.cantidad <= 1}
                                            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                                        >
                                            <FaMinusCircle className="w-6 h-6" />
                                        </button>
                                        <span className="text-lg font-medium">{item.cantidad}</span>
                                        <button
                                            onClick={() => updateCartItemQuantity(item.cod_prod, item.cantidad + 1, item.prod_stock)}
                                            disabled={item.cantidad >= Math.min(item.prod_stock, 5)}
                                            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                                        >
                                            <FaPlusCircle className="w-6 h-6" />
                                        </button>
                                    </div>
                                    <p className="text-lg font-semibold w-28 text-center">Subtotal: ${calculateSubtotal(item.prod_precio, item.cantidad)}</p>
                                    <button onClick={() => handleRemoveClick(item.cod_prod)} className="text-red-600 hover:text-red-800">
                                        <FaTrashAlt className="w-6 h-6" />
                                    </button>

                                </div>
                            ))}
                            <div className="text-right mt-6">
                                <h2 className="text-2xl font-semibold">Subtotal: ${calculateTotal1()}</h2>
                            </div>
                            <button onClick={nextStep} className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 mt-6 rounded-lg w-full md:w-auto">
                                Continuar a Datos
                            </button>
                        </div>
                    )}
                </div>
            )}

            {showConfirmPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-96 text-center">
                        <h2 className="text-xl font-semibold mb-4">¿Estás seguro?</h2>
                        <p className="text-gray-600 mb-6">¿Quieres eliminar este producto del carrito?</p>
                        <div className="flex justify-around">
                            <button
                                onClick={confirmRemove}
                                className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition"
                            >
                                Eliminar
                            </button>
                            <button
                                onClick={cancelRemove}
                                className="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-400 transition"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/* Paso 2: Datos */}
            {step === 2 && (
                <div>
                    <h2 className="text-4xl font-extrabold text-gray-800 text-center mb-8">Datos del Usuario</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 bg-white shadow-lg rounded-lg transition-shadow duration-200 hover:shadow-xl">
                        <div className="flex items-center text-lg text-gray-700">
                            <HiOutlineUser className="mr-3 text-blue-600" />
                            <p><span className="font-semibold">Nombre:</span> {user.nombre}</p>
                        </div>
                        <div className="flex items-center text-lg text-gray-700">
                            <HiOutlineUser className="mr-3 text-blue-600" />
                            <p><span className="font-semibold">Apellido:</span> {user.cli_apellido}</p>
                        </div>
                        <div className="flex items-center text-lg text-gray-700">
                            <HiOutlineUser className="mr-3 text-blue-600" />
                            <p><span className="font-semibold">CUIL:</span> {user.cli_cuil}</p>
                        </div>
                        <div className="flex items-center text-lg text-gray-700">
                            <HiOutlineUser className="mr-3 text-blue-600" />
                            <p><span className="font-semibold">DNI:</span> {user.cli_dni}</p>
                        </div>
                        <div className="flex items-center text-lg text-gray-700">
                            <HiOutlineUser className="mr-3 text-blue-600" />
                            <p><span className="font-semibold">Email:</span> {user.email}</p>
                        </div>
                        <div className="flex items-center text-lg text-gray-700">
                            <HiOutlinePhone className="mr-3 text-blue-600" />
                            <p><span className="font-semibold">Teléfono:</span> {user.cli_telefono || 'No disponible'}</p>
                        </div>
                        <Link
                            to="/EditarPerfil"
                            className="mt-4 w-full md:w-auto text-center bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-lg shadow transition-colors duration-300"
                        >
                            Editar Perfil
                        </Link>
                    </div>


                    <h2 className="text-xl font-semibold mb-4">Datos de Envío</h2>
                    {/* Mensaje de advertencia si falta dirección */}
                    {(address.calle == 'Completar' || address.numero == 'Completar') && (
                        <p className="text-yellow-500 mb-4">Por favor, complete los datos de la dirección.</p>
                    )}
                    <div>
                        {console.log('addres', address)}
                        <div>
                            {address.length > 0 ? (
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Seleccionar Domicilio</h3>
                                    {address.map((address, index) => (
                                        <div key={index} className="mb-2 p-2 border border-gray-300 rounded">
                                            <p>Calle: {address.calle}</p>
                                            <p>Altura: {address.numero}</p>
                                            <p>Piso: {address.piso || 'N/A'}</p>
                                            <p>Depto: {address.dpto || 'N/A'}</p>
                                            <button
                                                onClick={() => setSelectedAddress(address)}
                                                className={`mt-2 px-4 py-1 rounded ${selectedAddress == address ? 'bg-blue-500 text-white' : 'bg-green-200'}`}
                                            >
                                                {selectedAddress == address ? 'Domicilio Seleccionado' : 'Seleccionar'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p>No tienes domicilios registrados.</p>
                            )}
                        </div>

                        {/* Botón para abrir el popup de agregar domicilio */}
                        <button
                            onClick={() => setIsPopupOpen(true)}
                            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
                        >
                            {selectedAddress ? 'Cambiar domicilio' : 'Agregar domicilio'}
                        </button>

                        {/* Selección de dirección */}
                        {selectedAddress && (
                            <div className="mt-4 p-2 border border-blue-300 rounded bg-blue-100">
                                Dirección seleccionada: {selectedAddress.calle}, {selectedAddress.numero}
                            </div>
                        )}

                        {/* Popup para agregar domicilio */}
                        {isPopupOpen && (
                            <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
                                <div className="bg-white p-6 rounded shadow-lg w-80">
                                    <h3 className="text-lg font-semibold mb-4">Agregar nuevo domicilio</h3>
                                    <input
                                        type="text"
                                        placeholder="Calle"
                                        className="border p-2 w-full mb-2"
                                        onChange={(e) => setAddress({ ...address, calle: e.target.value })}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Número"
                                        className="border p-2 w-full mb-2"
                                        onChange={(e) => setAddress({ ...address, numero: e.target.value })}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Piso"
                                        className="border p-2 w-full mb-2"
                                        onChange={(e) => setAddress({ ...address, piso: e.target.value })}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Depto"
                                        className="border p-2 w-full mb-2"
                                        onChange={(e) => setAddress({ ...address, dpto: e.target.value })}
                                    />
                                    <button
                                        onClick={generarDomic}
                                        className="bg-green-500 text-white px-4 py-2 rounded w-full mt-2"
                                    >
                                        Guardar domicilio
                                    </button>
                                    <button
                                        onClick={() => setIsPopupOpen(false)}
                                        className="bg-red-500 text-white px-4 py-2 rounded w-full mt-2"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Selección de provincia y localidad */}
                        <div className="mt-4 flex items-center">
                            {/* Selección de provincia */}
                            <select onChange={handleProvinceChange} className="border p-2">
                                <option value="">Provincia*</option>
                                {provinces.map((prov) => (
                                    <option key={prov.prov_id} value={prov.prov_id}>{prov.prov_nombre}</option>
                                ))}
                            </select>

                            {/* Selección de localidad */}
                            {localidades.length > 0 && (
                                <div className="flex items-center ml-2">
                                    <select onChange={handleLocalidadChange} className="border p-2">
                                        <option value="">Localidad*</option>
                                        {localidades.map((loc) => (
                                            <option key={loc.local_codpostal} value={loc.local_codpostal}>{loc.local_nombre}</option>
                                        ))}
                                    </select>

                                    {/* Mostrar el código postal al lado de la localidad seleccionada */}
                                    {selectedPostalCode && (
                                        <p className="ml-4 text-gray-700">Código Postal: {selectedPostalCode}</p>
                                    )}
                                </div>
                            )}
                            <div className="text-right mt-6">
                                <h2 className="text-2xl font-semibold">Total: ${calculateTotal()}</h2>
                            </div>
                        </div>
                    </div>
                    {missingData && (
                        <p className="text-red-500 mt-4 text-center">Por favor, completa todos los campos obligatorios antes de continuar.</p>
                    )}
                    {costoEnvio && <p className="mt-4">Costo de Envío: ${costoEnvio}</p>}
                    <div className="flex justify-between mt-4">
                        <button onClick={prevStep} className="bg-gray-500 text-white px-4 py-2 rounded-lg">Volver al Carrito</button>
                        <button onClick={nextStep} className="bg-blue-500 text-white px-4 py-2 rounded-lg">Continuar a Pago</button>
                    </div>
                </div>
            )}

            {/* Paso 3: Pago */}
            {step === 3 && (
                <div className="bg-white p-6 shadow-md rounded-lg">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800">Método de Pago</h2>

                    {error && <p className="text-red-500 mb-4">{error}</p>} {/* Mostrar error si existe */}

                    {metodosPago.map((metodo) => (
                        <label key={metodo.metpago_id} className="flex items-center mb-3 text-lg">
                            <input
                                type="radio"
                                name="metodoPago"
                                value={metodo.descripcion}
                                onChange={() => handleMetodoChange(metodo)}
                                className="mr-3 accent-blue-500"
                            />
                            {metodo.descripcion}
                        </label>
                    ))}
                    <div className="text-right mt-6">
                        <h2 className="text-2xl font-semibold">Total: ${calculateTotal()}</h2>
                    </div>

                    {/* Detalles para Transferencia Bancaria */}
                    {selectedMetodo?.descripcion === "Transferencia Bancaria" && (
                        <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <h3 className="text-xl font-semibold mb-2">Datos para Transferencia Bancaria</h3>
                            <p><strong>CBU:</strong> 1234567890123456789012</p>
                            <p><strong>Alias:</strong> BANCO.DEMO.CUENTA</p>
                            <p><strong>Banco:</strong> Banco Simulado</p>
                            <p><strong>Titular:</strong> Juan Pérez</p>
                            <p className="mt-4 text-sm text-gray-600">
                                Una vez realizado el pago, envíe el comprobante por correo <strong>correo@ejemplo.com </strong>
                                o si prefiere a nuestro whatsapp <strong>+543875679134 </strong>
                                indicando sus datos o el nombre desde el cual se realizó la transferencia. <strong>En cuanto recibamos
                                    el comprobante, su pedido será procesado dentro de las proximas 24 horas. </strong>
                                Podra verificar el estado de su pedido en su perfil!
                            </p>
                            {/* <p>Por favor suba el comprobante del pago</p>
                            <input type="file" /> */}
                        </div>
                    )}

                    {/* Formulario de Tarjeta */}
                    {(selectedMetodo?.descripcion == "Tarjeta de crédito" || selectedMetodo?.descripcion == "Tarjeta de débito") && (
                        <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <h3 className="text-xl font-semibold mb-2">Datos de Tarjeta</h3>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Número de Tarjeta</label>
                                <input type="text" className="w-full p-2 border rounded mt-1" placeholder="XXXX-XXXX-XXXX-XXXX" />
                            </div>

                            <div className="mb-4 grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Fecha de Expiración</label>
                                    <input type="text" className="w-full p-2 border rounded mt-1" placeholder="MM/AA" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Código CVV</label>
                                    <input type="text" className="w-full p-2 border rounded mt-1" placeholder="XXX" />
                                </div>
                            </div>

                            {/* Selección de cuotas para Tarjeta de Crédito */}
                            {selectedMetodo?.descripcion == "Tarjeta de crédito" && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">Cuotas</label>
                                    <select className="w-full p-2 border rounded mt-1">
                                        <option value="1">1 Cuota</option>
                                        <option value="3">3 Cuotas</option>
                                        <option value="6">6 Cuotas</option>
                                        <option value="12">12 Cuotas</option>
                                    </select>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex justify-between mt-6">
                        <button onClick={prevStep} className="bg-gray-500 text-white px-4 py-2 rounded-lg">Volver a Datos</button>
                        <button onClick={generarVenta} className="bg-green-500 text-white px-4 py-2 rounded-lg">Finalizar Compra</button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Carrito;
