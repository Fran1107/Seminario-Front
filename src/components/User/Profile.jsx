import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthService } from "../../Cookies/AuthService";
import { HiOutlineShoppingCart, HiOutlineDocumentText } from "react-icons/hi";
import { HiOutlineUser, HiOutlinePhone, HiOutlineLocationMarker } from "react-icons/hi";
import { useNavigate } from 'react-router-dom';
import { HiOutlineArrowRight } from "react-icons/hi2";
import Swal from 'sweetalert2';
import VentaPDF from "../VentaPDF";
import { PDFDownloadLink } from '@react-pdf/renderer'

const Profile = () => {
    const [user, setUser] = useState(null);
    const [facturas, setFacturas] = useState([]);
    const [pedidos, setPedidos] = useState([]);
    const [ventaData, setVentaData] = useState(null);
    const [loadingFactura, setLoadingFactura] = useState(false);
    const navigate = useNavigate();
    const [domicilios, setDomicilios] = useState([]);


    useEffect(() => {
        const loggedUser = AuthService.getUser();
        setUser(loggedUser);
        if (loggedUser && loggedUser.cli_cuil < 10000000) {
            navigate('/EditarPerfil')
            Swal.fire('¡BIENVENIDO!', 'COMPLETA TUS DATOS PARA SEGUIR NAVEGANDO POR FAVOR', 'warning');
        }
        const fetchFacturasYPedidos = async () => {
            try {
                const responseFactura = await fetch(`http://localhost:3000/ventas/${loggedUser.cli_cuil}`);
                if (responseFactura.ok) {
                    const facturasData = await responseFactura.json();
                    setFacturas(facturasData);

                    // Crear una lista aplanada de todos los pedidos
                    const pedidosData = await Promise.all(
                        facturasData.map(async (factura) => {
                            const responsePedido = await fetch(`http://localhost:3000/pedido/${factura.nro_factura}`);
                            if (responsePedido.ok) {
                                const pedidos = await responsePedido.json();
                                return pedidos.map((pedido) => ({
                                    ...pedido,
                                    nro_factura: factura.nro_factura, // Agrega nro_factura para cada pedido
                                }));
                            } else {
                                console.error("Error al obtener los pedidos por nro_factura");
                                return [];
                            }
                        })
                    );

                    // Aplanar la estructura para tener todos los pedidos en un solo array
                    setPedidos(pedidosData.flat());
                } else {
                    console.error("Error al obtener las facturas de ventas por cli_cuil");
                }
            } catch (error) {
                console.error("Error al obtener el historial de facturas y pedidos:", error);
            }
        };

        const fetchDomicilios = async () => {
            try {
                const response = await fetch(`http://localhost:3000/domicilio/${loggedUser.cli_cuil}`);
                if (response.ok) {
                    const domiciliosData = await response.json();
                    setDomicilios(domiciliosData);
                } else {
                    console.error("Error al obtener los domicilios del usuario.");
                }
            } catch (error) {
                console.error("Error al obtener los domicilios:", error);
            }
        };

        if (loggedUser) {
            fetchFacturasYPedidos();
            fetchDomicilios();
        }
    }, []);

    const fetchVentaData = async (nroFactura) => {
        setLoadingFactura(true); 
        try {
            const responseDetVenta = await fetch(`http://localhost:3000/ventas/detVenta/${nroFactura}`);
            if (!responseDetVenta.ok) throw new Error("Error al obtener detalles de venta");

            const detVentaData = await responseDetVenta.json();

            const productosData = await Promise.all(
                detVentaData.map(async (item) => {
                    const responseProducto = await fetch(`http://localhost:3000/products/${item.cod_prod}`);
                    if (!responseProducto.ok) throw new Error("Error al obtener datos del producto");

                    const productoData = await responseProducto.json();

                    return {
                        ...item,
                        nombre: productoData.prod_nombre,
                    };
                })
            );

            // Filtrar pedidos relacionados con la factura actual
            const pedidosRelacionados = pedidos.filter(pedido => pedido.nro_factura === nroFactura);

            setVentaData({
                nroFactura,
                fecha: facturas.find(f => f.nro_factura === nroFactura).venta_fecha,
                total: facturas.find(f => f.nro_factura === nroFactura).venta_total,
                productos: productosData,
                cliente: user,
                pedidos: pedidosRelacionados,
            });
        } catch (error) {
            console.error("Error al obtener datos de venta:", error);
        } finally {
            setLoadingFactura(false); 
        }
    };

    if (!user) {
        return (
            <Link to="/login" className="text-blue-600 hover:underline mt-4 inline-block">
                Necesitas Iniciar sesión!
            </Link>
        );
    }

    return (

        <div className="container mx-auto px-4 py-6">

            <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-6">Mi Perfil</h1>

            {/* Información del usuario */}
            <div className="bg-gray-100 text-gray-800 shadow-lg rounded-lg p-8 mb-8">
                <h2 className="text-3xl font-bold mb-4">Datos del Usuario</h2>
                <div className="space-y-2">
                    <p className="flex items-center"><HiOutlineUser className="mr-2" /> <strong>Nombre:</strong> {user.nombre}</p>
                    <p className="flex items-center"><HiOutlineUser className="mr-2" /> <strong>Apellido:</strong> {user.cli_apellido}</p>
                    <p className="flex items-center"><HiOutlineUser className="mr-2" /> <strong>CUIL:</strong> {user.cli_cuil}</p>
                    <p className="flex items-center"><HiOutlineUser className="mr-2" /> <strong>DNI:</strong> {user.cli_dni}</p>
                    <p className="flex items-center"><HiOutlineUser className="mr-2" /> <strong>Email:</strong> {user.email}</p>
                    <p className="flex items-center"><HiOutlinePhone className="mr-2" /> <strong>Teléfono:</strong> {user.cli_telefono || 'No disponible'}</p>
                    <p className="flex items-center"><HiOutlineLocationMarker className="mr-2" /> <strong>Provincia:</strong> {user.provincia}</p>
                </div>
                <Link
                    to="/EditarPerfil"
                    className="inline-block mt-4 text-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-300 py-2 px-4 rounded-full"
                >
                    Editar Perfil
                </Link>
            </div>

            <div className="bg-gray-100 text-gray-800 shadow-lg rounded-lg p-8 mb-8">
                <h2 className="text-3xl font-bold mb-4">Domicilios Registrados</h2>
                {domicilios.length === 0 ? (
                    <p className="text-gray-600">No tienes domicilios registrados.</p>
                ) : (
                    <ul className="space-y-4">
                        {domicilios.map((domicilio, index) => (
                            <li key={index} className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
                                <p><strong>Calle:</strong> {domicilio.calle}</p>
                                <p><strong>Altura:</strong> {domicilio.numero}</p>
                                <p><strong>Dpto:</strong> {domicilio.dpto}</p>
                                <p><strong>Piso:</strong> {domicilio.piso}</p>
                                
                            </li>
                        ))}
                    </ul>
                )}
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Sección de Pedidos */}
                <div className="bg-white shadow-lg rounded-lg p-6 flex-grow min-h-[400px]">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                        <HiOutlineShoppingCart className="text-2xl text-indigo-600 mr-2" /> Mis Pedidos
                    </h2>
                    {pedidos.length === 0 ? (
                        <p className="text-gray-600">No tienes pedidos registrados.</p>
                    ) : (
                        <ul className="space-y-4">
                            {pedidos.map((pedido, index) => (
                                <li key={index} className="bg-gray-50 rounded-lg p-4 shadow-md border border-gray-200">
                                    <div className="mb-2">
                                        <p className="text-gray-800 font-medium"><strong>Nro Pedido:</strong> {pedido.pedido_id}</p>
                                        <p className="text-gray-800"><strong>Estado:</strong> {pedido.estado}</p>
                                        <p className="text-gray-800"><strong>Nro Factura:</strong> {pedido.nro_factura}</p>
                                    </div>
                                    <Link
                                        to={`/pedido/getPedido/${pedido.pedido_id}`}
                                        className="inline-flex items-center justify-center bg-blue-500 text-white font-semibold py-2 px-5 rounded-lg shadow-md hover:bg-blue-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
                                    >
                                        Ver detalles
                                        <HiOutlineArrowRight className="ml-2 text-lg" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                {/* Sección de Facturas */}
                <div className="bg-white shadow-lg rounded-lg p-6 flex-grow min-h-[400px]">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                        <HiOutlineDocumentText className="text-2xl text-indigo-600 mr-2" /> Mis Facturas
                    </h2>
                    {facturas.length === 0 ? (
                        <p className="text-gray-600">No tienes facturas registradas.</p>
                    ) : (
                        <ul className="space-y-4">
                            {facturas.map((factura, index) => (
                                <li key={index} className="bg-gray-50 rounded-lg p-4 shadow-md border border-gray-200">
                                    <div className="mb-2">
                                        <p className="text-gray-800 font-medium"><strong>Nro Factura:</strong> {factura.nro_factura}</p>
                                        <p className="text-gray-800"><strong>Fecha:</strong> {new Date(factura.venta_fecha).toLocaleDateString()}</p>
                                        <p className="text-base text-indigo-600 font-bold">
                                            <strong>Total:</strong> ${parseFloat(factura.venta_total).toLocaleString('es-AR', {
                                                minimumFractionDigits: 0,
                                            })}
                                        </p>
                                        <button
                                            onClick={() => fetchVentaData(factura.nro_factura)}
                                            className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition duration-300 ease-in-out mr-4"
                                        >
                                            Cargar Factura
                                        </button>
                                        {ventaData && ventaData.nroFactura === factura.nro_factura && !loadingFactura && (
                                            <PDFDownloadLink
                                                document={<VentaPDF ventaData={ventaData} />}
                                                fileName={`Factura-${factura.nro_factura}.pdf`}
                                            >
                                                {({ loading }) => (
                                                    <button
                                                        className={`px-4 py-2 ${loading ? 'bg-gray-400' : 'bg-green-500'
                                                            } text-white font-semibold rounded-lg shadow-md ${loading ? '' : 'hover:bg-green-600 hover:shadow-lg'
                                                            } focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 transition duration-300 ease-in-out`}
                                                    >
                                                        {loading ? 'Cargando Documento...' : 'Descargar Factura'}
                                                    </button>
                                                )}
                                            </PDFDownloadLink>
                                        )}

                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

            </div>
        </div>
    );
};

export default Profile;
