import { PDFDownloadLink } from '@react-pdf/renderer';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import VentaPDF from '../VentaPDF';

const SidebarItem = ({ to, label }) => (
    <Link
        to={to}
        className="block px-4 py-2 rounded-lg text-gray-600 hover:bg-[#4a9d9c]"
    >
        {label}
    </Link>
);

const Sidebar = () => (
    <aside className="w-64 bg-[#c4c4c4] shadow-xl hidden md:block">
        <div className="p-4 border-b border-[#0D6E6E]">
            <h1 className="text-2xl font-semibold text-gray-800">Admin Panel</h1>
        </div>
        <nav className="p-4">
            <ul className="space-y-4">
                <li className="font-bold text-xl"><SidebarItem to="/admin" label="Dashboard" /></li>
                <li className="font-bold text-xl"><SidebarItem to="/manage-products" label="Productos" /></li>
                <li className="font-bold text-xl"><SidebarItem to="/ventas" label="Ventas" /></li>
                <li className="font-bold text-xl"><SidebarItem to="/users" label="Usuarios" /></li>
                <li className="font-bold text-xl"><SidebarItem to="/categorias" label="Categorias" /></li>
                <li className="font-bold text-xl"><SidebarItem to="/marcas" label="Marcas" /></li>
            </ul>
        </nav>
    </aside>
);

const Popup = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
                <h2 className="text-lg font-semibold mb-4">Opciones</h2>
                <nav>
                    <ul className="space-y-4">
                        <li className="font-bold text-xl"><SidebarItem to="/admin" label="Dashboard" /></li>
                        <li className="font-bold text-xl"><SidebarItem to="/manage-products" label="Productos" /></li>
                        <li className="font-bold text-xl"><SidebarItem to="/ventas" label="Ventas" /></li>
                        <li className="font-bold text-xl"><SidebarItem to="/users" label="Usuarios" /></li>
                        <li className="font-bold text-xl"><SidebarItem to="/categorias" label="Categorias" /></li>
                        <li className="font-bold text-xl"><SidebarItem to="/marcas" label="Marcas" /></li>
                    </ul>
                </nav>
                <button
                    onClick={onClose}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                    Cerrar
                </button>
            </div>
        </div>
    );
};

const Panel = () => {
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [totalProductos, setTotalProductos] = useState(0);
    const [totalVentas, setTotalVentas] = useState(0);
    const [totalUsuarios, setTotalUsuarios] = useState(0);
    const [gananciasTotales, setGananciasTotales] = useState(0);
    const [ventas, setVentas] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const ventasPerPage = 5;
    const [ventaData, setVentaData] = useState(null);
    const [loadingFactura, setLoadingFactura] = useState(false);

    const fetchVentaData = async (nroFactura, cliCuil) => {
        setLoadingFactura(true);
        try {
            // Obtener los detalles de venta
            const responseDetVenta = await fetch(`http://localhost:3000/ventas/detVenta/${nroFactura}`);
            if (!responseDetVenta.ok) throw new Error("Error al obtener detalles de venta");

            const detVentaData = await responseDetVenta.json();

            // Obtener información de los productos
            const productosData = await Promise.all(
                detVentaData.map(async (item) => {
                    const responseProducto = await fetch(`http://localhost:3000/products/${item.cod_prod}`);
                    if (!responseProducto.ok) throw new Error("Error al obtener datos del producto");
                    const productoData = await responseProducto.json();
                    return {
                        ...item,
                        nombre: productoData.prod_nombre,
                    };
                }),
            );

            // Obtener detalles del cliente
            const responseCliente = await fetch(`http://localhost:3000/user/${cliCuil}`);
            if (!responseCliente.ok) throw new Error("Error al obtener datos del cliente");
            const clienteData = await responseCliente.json();

            // Obtener los pedidos relacionados con la factura
            const responsePedidos = await fetch(`http://localhost:3000/pedido/${nroFactura}`);
            if (!responsePedidos.ok) throw new Error("Error al obtener los pedidos");
            const pedidosData = await responsePedidos.json();

            // Actualizar el estado con los datos de la venta, incluyendo los pedidos
            setVentaData({
                nroFactura,
                fecha: ventas.find(f => f.nro_factura === nroFactura).venta_fecha,
                total: ventas.find(f => f.nro_factura === nroFactura).venta_total,
                productos: productosData,
                cliente: clienteData,
                pedidos: pedidosData, 
            });
        } catch (error) {
            console.error("Error al cargar datos de la venta:", error);
        } finally {
            setLoadingFactura(false);
        }
    };


    useEffect(() => {
        const fetchProductos = async () => {
            try {
                const response = await fetch('http://localhost:3000/products');
                const productos = await response.json();
                setTotalProductos(productos.length);
            } catch (error) {
                console.error('Error al obtener los productos:', error);
            }
        };

        const fetchVentas = async () => {
            try {
                const response = await fetch('http://localhost:3000/ventas');
                const ventasData = await response.json();
                setVentas(ventasData);
                setTotalVentas(ventasData.length);

                const totalGanancias = ventasData.reduce((sum, venta) => sum + Number(venta.venta_total || 0), 0);
                setGananciasTotales(totalGanancias);
            } catch (error) {
                console.error('Error al obtener las ventas:', error);
            }
        };

        const fetchUsuarios = async () => {
            try {
                const response = await fetch('http://localhost:3000/user');
                const usuarios = await response.json();
                setTotalUsuarios(usuarios.length);
            } catch (error) {
                console.error('Error al obtener los usuarios:', error);
            }
        };

        fetchProductos();
        fetchVentas();
        fetchUsuarios();
    }, []);

    const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

    const indexOfLastVenta = currentPage * ventasPerPage;
    const indexOfFirstVenta = indexOfLastVenta - ventasPerPage;
    const currentVentas = ventas.slice(indexOfFirstVenta, indexOfLastVenta);

    const totalPages = Math.ceil(ventas.length / ventasPerPage);

    const formatearFecha = (fecha) => {
        const fechaObj = new Date(fecha);
        return fechaObj.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar />
            <main className="flex-1 p-6">
                {/* Botón para abrir el popup */}
                <button
                    className="fixed bottom-4 right-4 bg-[#4a9d9c] text-white p-4 rounded-full shadow-lg hover:bg-[#367d7c] transition duration-300 md:hidden"
                    onClick={() => setIsPopupOpen(true)}
                >
                    Opciones
                </button>


                {/* Popup */}
                <Popup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} />
                <header className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold text-gray-700">Dashboard</h2>
                    {/* <button className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                        Nueva Acción
                    </button> */}
                </header>
                <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
                    <div className="p-4 bg-white shadow rounded-lg">
                        <h3 className="text-xl font-bold text-gray-600">Total Productos</h3>
                        <p className="mt-2 text-3xl font-bold text-gray-800">{totalProductos}</p>
                    </div>
                    <div className="p-4 bg-white shadow rounded-lg">
                        <h3 className="text-xl font-bold text-gray-600">Total Ventas</h3>
                        <p className="mt-2 text-3xl font-bold text-gray-800">{totalVentas}</p>
                    </div>
                    <div className="p-4 bg-white shadow rounded-lg">
                        <h3 className="text-xl font-bold text-gray-600">Usuarios</h3>
                        <p className="mt-2 text-3xl font-bold text-gray-800">{totalUsuarios}</p>
                    </div>
                    <div className="p-4 bg-white shadow rounded-lg">
                        <h3 className="text-xl font-bold text-gray-600">Ganancias</h3>
                        <p className="mt-2 text-3xl font-bold text-gray-800">${parseFloat(gananciasTotales).toLocaleString('es-AR', {
                            minimumFractionDigits: 0,
                        })}</p>
                    </div>
                </section>
                <section className="bg-white p-6 shadow rounded-lg mb-10">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Actividad Reciente</h3>
                    <table className="min-w-full bg-white border">
                        <thead>
                            <tr>
                                <th className="py-2 px-4 border-b">Nro Factura</th>
                                <th className="py-2 px-4 border-b">Fecha</th>
                                <th className="py-2 px-4 border-b">CUIL Cliente</th>
                                <th className="py-2 px-4 border-b">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentVentas.map((venta) => (
                                <tr key={venta.nro_factura}>
                                    <td className="py-2 px-4 border-b text-center">{venta.nro_factura}</td>
                                    <td className="py-2 px-4 border-b text-center">{formatearFecha(venta.venta_fecha)}</td>
                                    <td className="py-2 px-4 border-b text-center">{venta.cli_cuil}</td>
                                    <td className="py-2 px-4 border-b text-center">${parseFloat(Number(venta.venta_total)).toLocaleString('es-AR', {
                                        minimumFractionDigits: 0,
                                    })}</td>
                                    <td className="py-2 px-4 border-b text-center">
                                        <button
                                            onClick={() => fetchVentaData(venta.nro_factura, venta.cli_cuil)}
                                            className="px-4 py-2 bg-[#0D6E6E] text-white font-semibold rounded-lg shadow-md hover:bg-[#4a9d9c] hover:shadow-lg transition duration-300 ease-in-out"
                                        >
                                            Generar PDF
                                        </button>
                                        {ventaData && ventaData.nroFactura === venta.nro_factura && !loadingFactura && (
                                            <PDFDownloadLink
                                                document={<VentaPDF ventaData={ventaData} />}
                                                fileName={`Factura-${venta.nro_factura}.pdf`}
                                            >
                                                {({ loading }) => (
                                                    <button
                                                        className={`px-4 py-2 mt-2 ${loading ? 'bg-gray-400' : 'bg-green-500'
                                                            } text-white font-semibold rounded-lg shadow-md ${loading ? '' : 'hover:bg-green-600 hover:shadow-lg'
                                                            } focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 transition duration-300 ease-in-out`}
                                                    >
                                                        {loading ? 'Cargando PDF...' : 'Descargar PDF'}
                                                    </button>
                                                )}
                                            </PDFDownloadLink>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="flex justify-center mt-4">
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => handlePageChange(i + 1)}
                                className={`px-4 py-2 mx-1 rounded ${currentPage === i + 1 ? 'bg-[#0D6E6E] text-white' : 'bg-gray-200'}`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                </section>

            </main>
        </div>
    );
};

export default Panel;
