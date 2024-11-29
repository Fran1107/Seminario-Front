import React, { useContext, useEffect, useState } from 'react';
import { CartContext } from '../Context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { AuthService } from "../../Cookies/AuthService";
import Swal from 'sweetalert2';
import { TbUserQuestion } from "react-icons/tb";
import { FaShieldAlt } from "react-icons/fa";
import { FaVanShuttle } from "react-icons/fa6";

const ItemDetail = ({ item }) => {
    const { addToCart, getProductQuantity } = useContext(CartContext);
    const cartQuantity = getProductQuantity(item.cod_prod);
    const isAddDisabled = cartQuantity >= Math.min(item.prod_stock, 5);
    const navigate = useNavigate(); 
    const [showNotification, setShowNotification] = useState(false); 
    const isUserLoggedIn = () => !!AuthService.getUser();
    const precioProd = parseFloat(item.prod_precio).toLocaleString('es-AR', {
        minimumFractionDigits: 0,
    });
    const [selectedImage, setSelectedImage] = useState(null);
    const [specifications, setSpecifications] = useState([]);
    const [consultas, setConsultas] = useState([]); 
    const [newConsulta, setNewConsulta] = useState(''); 
    const user = AuthService.getUser();
    const isOperator = user?.rol == 'Operador';
    const [activeTab, setActiveTab] = useState("especificaciones"); 
    const [showLimitMessage, setShowLimitMessage] = useState(false); 

    useEffect(() => {
        // Obtener especificaciones del producto
        const fetchSpecifications = async () => {
            try {
                const response = await fetch(
                    `http://localhost:3000/especificacion/getEspecificacion/${item.cod_prod}`
                );
                if (!response.ok) {
                    throw new Error('Error al obtener las especificaciones');
                }
                const data = await response.json();
                setSpecifications(data);
            } catch (error) {
                console.error('Error al cargar las especificaciones:', error);
            }
        };


        if (item.cod_prod) {
            fetchSpecifications();

        }
    }, [item.cod_prod]);

    // Obtener consultas del producto
    const fetchConsultas = async () => {
        try {
            const response = await fetch(`http://localhost:3000/consulta/${item.cod_prod}`);
            if (!response.ok) {
                throw new Error('Error al obtener consultas');
            }
            const data = await response.json();
            setConsultas(data);
        } catch (error) {
            console.error('Error al cargar consultas:', error);
        }
    };

    useEffect(() => {
        if (item.cod_prod) {
            fetchConsultas();
        }
    }, [item.cod_prod]);

    const handleTabChange = (tab) => setActiveTab(tab);

    const handleImageClick = (url) => {
        setSelectedImage(url);
    };

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
            addToCart(item);
            setShowNotification(true);
            setTimeout(() => setShowNotification(false), 6000);
        } else {
            setShowLimitMessage(true);
            setTimeout(() => setShowLimitMessage(false), 4000); // Ocultar el mensaje después de 4 segundos
        }
    };

    // Manejar envío de nueva consulta
    const handleSubmitConsulta = async () => {
        if (!newConsulta.trim()) {
            Swal.fire('Error', 'La consulta no puede estar vacía', 'error');
            return;
        }

        if(!user){
            Swal.fire('Error', 'Debes iniciar sesión para realizar tu consulta', 'error');
            return navigate('/login');
        }

        try {
            const response = await fetch('http://localhost:3000/consulta/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    consulta_pregunta: newConsulta,
                    cod_prod: item.cod_prod,
                    cli_cuil: user?.cli_cuil,
                }),
            });

            if (!response.ok) {
                throw new Error('Error al enviar la consulta');
            }

            const result = await response.json();
            setConsultas([...consultas, result.consulta]); 
            setNewConsulta(''); 
        } catch (error) {
            console.error('Error al enviar consulta:', error);
            Swal.fire('Error', 'No se pudo enviar la consulta', 'error');
        }
    };

    const handleResponder = async (consultaId, respuesta) => {
        try {
            const response = await fetch('http://localhost:3000/consulta/createRespuesta', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    consulta_id: consultaId,
                    consulta_respuesta: respuesta,
                    oper_cuil: user.oper_cuil, 
                }),
            });

            if (!response.ok) {
                throw new Error('Error al enviar la respuesta');
            }

            const data = await response.json();
            Swal.fire('Respuesta enviada', 'La respuesta fue registrada correctamente', 'success');
            
            fetchConsultas();
        } catch (error) {
            console.error('Error al responder:', error);
            Swal.fire('Error', 'No se pudo enviar la respuesta', 'error');
        }
    };


    return (
        <div className="container mx-auto p-6">
            <div className="bg-white shadow-md rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col items-center">
                    <img
                        src={selectedImage ||
                            (item.images && item.images.length > 0
                                ? item.images.find(img => !img.hidden)?.url_imagen || 'https://via.placeholder.com/300'
                                : 'https://via.placeholder.com/300')}
                        alt={item.prod_nombre}
                        className="max-w-full max-h-96 object-contain"
                    />
                    <div className="flex space-x-4 mt-4">
                        {item.images && item.images
                            .filter(img => !img.hidden)
                            .map((img, idx) => (
                                <img
                                    key={img.imgprod_id}
                                    src={img.url_imagen}
                                    alt={`Imagen ${idx + 1}`}
                                    className={`w-16 h-16 border object-cover cursor-pointer ${selectedImage === img.url_imagen ? 'border-orange-500' : 'border-gray-300'}`}
                                    onClick={() => handleImageClick(img.url_imagen)}
                                />
                            ))
                        }
                    </div>
                </div>

                <div className="flex flex-col">
                    {showNotification && (
                        <Link to='/carrito' className="top-0 right-0 mt-2 mr-2 bg-green-500 text-white px-4 py-2 rounded shadow">
                            ¡Listo producto agregado al carrito!
                            Click aquí para seguir con la compra
                        </Link>
                    )}
                    <h2 className="text-2xl font-bold mb-4">{item.prod_nombre}</h2>
                    <p className="text-gray-500 mb-2">Categoría: {item.categoria}</p>
                    <p className="text-gray-500 mb-2">Marca: {item.marca}</p>
                    {/* Stock disponible */}
                    {item.prod_stock > 0 ? (
                        <p className="text-green-600 font-semibold mb-4">Stock disponible: {item.prod_stock}</p>
                    ) : (
                        <p className="text-red-600 font-semibold mb-4">No hay stock</p>
                    )}
                    <p className="text-3xl text-red-600 font-bold mb-4">${precioProd}</p>
                    <p className="text-gray-700 mb-4">{item.prod_descripcion}</p>
                    {/* Botón agregar al carrito y mensaje de límite */}
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={handleAddToCart}
                            disabled={isAddDisabled || item.prod_stock <= 0}
                            className={`px-4 py-2 rounded-lg ${isAddDisabled || item.prod_stock <= 0
                                ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                                : "bg-[#0D6E6E] text-white hover:bg-[#4a9d9c]"
                                }`}
                        >
                            Agregar al carrito
                        </button>
                        {showLimitMessage && (
                            <p className="text-red-600 mt-2">No puedes agregar más de 5 productos a tu carrito.</p>
                        )}
                    </div>
                    <div className="mt-6">
                        <p className="text-green-500 flex items-center"> <FaShieldAlt className="mr-2" />Garantía - 12 meses</p>
                        <p className="text-green-500 flex items-center"><FaVanShuttle className="mr-2" />Envíos a todo el país</p>
                    </div>
                </div>
            </div>
            <div className="bg-white shadow-md rounded-lg p-4">

                {/* Tabs */}
                <div className="flex border-b">
                    <button
                        onClick={() => handleTabChange("especificaciones")}
                        className={`flex-1 text-center py-2 border-b-2 font-bold text-xl ${activeTab === "especificaciones"
                            ? "border-[#0D6E6E] text-[#0D6E6E] font-bold"
                            : "border-transparent text-gray-500"
                            } hover:text-[#4a9d9c]`}
                    >
                        Especificaciones
                    </button>
                    <button
                        onClick={() => handleTabChange("consultas")}
                        className={`flex-1 text-center py-2 border-b-2 font-bold text-xl ${activeTab === "consultas"
                            ? "border-[#0D6E6E] text-[#0D6E6E] font-bold"
                            : "border-transparent text-gray-500"
                            } hover:text-[#4a9d9c]`}
                    >
                        Consultas
                    </button>
                </div>
                {/* Contenido de las Tabs */}
                <div className="mt-6">
                    {activeTab === "especificaciones" && (
                        <div>
                            <h3 className="text-xl font-bold mb-4">Especificaciones del Producto</h3>
                            {specifications.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {specifications.map((spec, index) => (
                                        <div key={index}>
                                            <h4 className="text-lg font-bold text-red-500 mb-4 uppercase">
                                                {spec.esp_titulo}
                                            </h4>
                                            <table className="w-full text-sm">
                                                <tbody>
                                                    {spec.nombres.map((nombre) => (
                                                        <tr key={nombre.nombre_id} className="border-b">
                                                            <td className="py-2 px-4 font-bold text-gray-500">
                                                                {nombre.nombre_titulo}
                                                            </td>
                                                            <td className="py-2 px-4 text-right text-gray-700">
                                                                {nombre.nombre_descripcion}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">No hay especificaciones disponibles.</p>
                            )}
                        </div>
                    )}

                    {activeTab === "consultas" && (
                        <div>
                            <h3 className="text-xl font-bold mb-4">Consultas sobre el Producto</h3>
                            <textarea
                                value={newConsulta}
                                onChange={(e) => setNewConsulta(e.target.value)}
                                placeholder="Escribe tu consulta..."
                                className="w-full border rounded-lg p-2 mb-4"
                            />
                            <button
                                onClick={handleSubmitConsulta}
                                className="bg-[#0D6E6E] text-white px-4 py-2 rounded-lg hover:bg-[#4a9d9c]"
                            >
                                Enviar Consulta
                            </button>
                            <p className="font-bold mt-4 mb-2">Otros usuarios consultaron</p>
                            {consultas.length > 0 ? (
                                consultas
                                    .slice()
                                    .sort((a, b) => b.consulta_id - a.consulta_id)
                                    .map((consulta) => (


                                        <div key={consulta.consulta_id} className="border p-4 my-4 rounded-lg bg-hoverTextColor">
                                            {/* <p className="font-bold">Consulta:</p> */}
                                            <div className='bg-[#a6c8e9] rounded-lg border p-4 my-4'>

                                                <p className="font-bold flex items-center">
                                                    <TbUserQuestion className="mr-2" />
                                                    {consulta.consulta_pregunta}
                                                </p>

                                                <p className="text-sm text-gray-700 text-right font-bold">
                                                    Fecha de pregunta: {new Date(consulta.consulta_fechapreg).toLocaleDateString()}
                                                </p>
                                            </div>
                                            {consulta.consulta_respuesta ? (
                                                <>
                                                    <p className="font-bold text-[#0D6E6E] mt-2">Respuesta:</p>
                                                    <p className="font-bold text-[#1d2e3d] ml-4">{consulta.consulta_respuesta}</p>
                                                    <p className="text-sm text-black text-right font-bold">
                                                        Fecha de respuesta: {new Date(consulta.consulta_fecharesp).toLocaleDateString()}
                                                    </p>
                                                </>
                                            ) : (
                                                isOperator && (
                                                    <form
                                                        onSubmit={(e) => {
                                                            e.preventDefault();
                                                            const respuesta = e.target.elements.respuesta.value;
                                                            handleResponder(consulta.consulta_id, respuesta);
                                                        }}
                                                    >
                                                        <textarea
                                                            name="respuesta"
                                                            placeholder="Escribe tu respuesta"
                                                            className="w-full border rounded-lg p-2 mb-2"
                                                            required
                                                        />
                                                        <button
                                                            type="submit"
                                                            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                                                        >
                                                            Responder
                                                        </button>
                                                    </form>
                                                )
                                            )}
                                        </div>

                                    ))
                            ) : (
                                <p className="text-gray-500">No hay consultas disponibles.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ItemDetail;
