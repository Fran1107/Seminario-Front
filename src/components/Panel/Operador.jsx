import React, { useState, useEffect } from 'react';
import { AuthService } from '../../Cookies/AuthService';
import { AiOutlineArrowLeft } from 'react-icons/ai';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

const Operador = () => {
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedPedido, setSelectedPedido] = useState(null);
    const [nuevoEstadoPedido, setNuevoEstadoPedido] = useState('');
    const [nuevoEstadoPago, setNuevoEstadoPago] = useState('');
    const [consultasSinRespuesta, setConsultasSinRespuesta] = useState([]); 

    const [currentPageAssigned, setCurrentPageAssigned] = useState(1);
    const [currentPageUnassigned, setCurrentPageUnassigned] = useState(1);
    const pedidosPorPagina = 5;

    const loggedUser = AuthService.getUser();

    // Estados posibles para el pedido
    const estadosPedido = [
        'Ingreso del pedido',
        'Confirmación de la reserva',
        'Carga del comprobante de pago',
        'Pago',
        'Chequeo de datos para la factura',
        'Preparado y chequeo de productos',
        'Armado final del pedido',
        'Despachado por el correo'
    ];
    

    // Estados posibles para el pago
    const estadosPago = ['Pendiente', 'Aprobado', 'Rechazado'];

    const handleAsignar = async (pedidoId) => {
        try {
            const response = await fetch(`http://localhost:3000/pedido/asignarOperador/${pedidoId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ oper_id: loggedUser.oper_cuil }),
            });
            if (!response.ok) throw new Error('Error al asignar operador');
            Swal.fire('Éxito', `Fuiste asignado al pedido ${pedidoId}`, 'success').then(() => {
                window.location.reload()
            });
            // Actualizar estado local
            setPedidos((prevPedidos) =>
                prevPedidos.map((pedido) =>
                    pedido.pedido_id === pedidoId ? { ...pedido, oper_id: loggedUser.oper_cuil } : pedido
                )
            );
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

    const handleEditar = (pedido) => {
        setSelectedPedido(pedido);
        setNuevoEstadoPedido(pedido.estado); 
        setNuevoEstadoPago(pedido.pago?.pago_estado || ''); 
        setModalOpen(true); 
    };

    const handleGuardar = async () => {
        try {
            const responsePedido = await fetch(`http://localhost:3000/pedido/editarEstado/${selectedPedido.pedido_id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado: nuevoEstadoPedido })
            });

            const responsePago = await fetch(`http://localhost:3000/pago/estado/${selectedPedido.nro_factura}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado: nuevoEstadoPago })
            });

            if (!responsePedido.ok || !responsePago.ok) {
                throw new Error('Error al guardar los estados');
            }

            Swal.fire('Éxito', 'Estado actualizado', 'success')
            setModalOpen(false); 
            // Actualizar los pedidos
            setPedidos((prevPedidos) =>
                prevPedidos.map((pedido) =>
                    pedido.pedido_id === selectedPedido.pedido_id
                        ? { ...pedido, estado: nuevoEstadoPedido, pago: { ...pedido.pago, pago_estado: nuevoEstadoPago } }
                        : pedido
                )
            );
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };


    useEffect(() => {
        const fetchPedidos = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://localhost:3000/pedido/getAll');
                if (!response.ok) throw new Error('Error al obtener los pedidos');
                const data = await response.json();

                const pedidosWithDetails = await Promise.all(
                    data.map(async (pedido) => {
                        const facturaResponse = await fetch(`http://localhost:3000/ventas/getFac/${pedido.nro_factura}`);
                        const factura = await facturaResponse.json();

                        const pagoResponse = await fetch(`http://localhost:3000/pago/getPago/${pedido.nro_factura}`);
                        const pagos = await pagoResponse.json();

                        if (pagos.length > 0) {
                            const pago = pagos[0];
                            const metodoPagoResponse = await fetch(`http://localhost:3000/metpago/${pago.metpago_id}`);
                            const metodoPago = await metodoPagoResponse.json();
                            return {
                                ...pedido,
                                factura,
                                pago,
                                metodoPago,
                            };
                        } else {
                            console.error(`No se encontró pago para la factura ${pedido.nro_factura}`);
                            return {
                                ...pedido,
                                factura,
                                pago: null,
                                metodoPago: null,
                            };
                        }
                    })
                );
                // Ordenar por pedido_id en orden descendente
                pedidosWithDetails.sort((a, b) => b.pedido_id - a.pedido_id);
                setPedidos(pedidosWithDetails);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        const fetchConsultasSinRespuesta = async () => {
            try {
                const response = await fetch('http://localhost:3000/consulta/sinrespuesta');
                if (!response.ok) throw new Error('Error al obtener las consultas sin respuesta');
                const data = await response.json();
                setConsultasSinRespuesta(data);
            } catch (err) {
                console.error('Error al obtener las consultas sin respuesta:', err.message);
            }
        };

        fetchPedidos();
        fetchConsultasSinRespuesta()
    }, []);

    const assignedPedidos = pedidos.filter((pedido) => pedido.oper_id === loggedUser.oper_cuil);
    const unassignedPedidos = pedidos.filter((pedido) => pedido.oper_id === null);

    // Obtener pedidos paginados
    const paginatedAssignedPedidos = assignedPedidos.slice(
        (currentPageAssigned - 1) * pedidosPorPagina,
        currentPageAssigned * pedidosPorPagina
    );

    const paginatedUnassignedPedidos = unassignedPedidos.slice(
        (currentPageUnassigned - 1) * pedidosPorPagina,
        currentPageUnassigned * pedidosPorPagina
    );

    // Calcular número de páginas
    const totalPagesAssigned = Math.ceil(assignedPedidos.length / pedidosPorPagina);
    const totalPagesUnassigned = Math.ceil(unassignedPedidos.length / pedidosPorPagina);

    const handlePageChange = (setPage, direction, totalPages) => {
        setPage((prevPage) => {
            const newPage = prevPage + direction;
            return newPage >= 1 && newPage <= totalPages ? newPage : prevPage;
        });
    };

    if (loading) return <div className="text-center py-10">Cargando pedidos...</div>;
    if (error) return <div className="text-center py-10 text-red-500">Error: {error}</div>;

    const renderPedidosTable = (title, pedidosList, isAssigned, currentPage, setPage, totalPages) => (
        <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{title}</h2>
            <table className="min-w-full bg-white border">
                <thead>
                    <tr>
                        <th className="px-4 py-2 border-b">Pedido ID</th>
                        <th className="px-4 py-2 border-b">Estado</th>
                        <th className="px-4 py-2 border-b">Nro Factura</th>
                        <th className="px-4 py-2 border-b">Fecha de Venta</th>
                        <th className="px-4 py-2 border-b">Total</th>
                        <th className="px-4 py-2 border-b">Método de Pago</th>
                        <th className="px-4 py-2 border-b">Estado de Pago</th>
                        <th className="px-4 py-2 border-b">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {pedidosList.map((pedido) => (
                        <tr key={pedido.pedido_id}>
                            <td className="px-4 py-2 border-b text-center">{pedido.pedido_id}</td>
                            <td className="px-4 py-2 border-b text-center bg-yellow-200">{pedido.estado}</td>
                            <td className="px-4 py-2 border-b text-center">{pedido.nro_factura}</td>
                            <td className="px-4 py-2 border-b text-center">
                                {pedido.factura?.[0]?.venta_fecha
                                    ? new Date(pedido.factura[0].venta_fecha).toLocaleDateString()
                                    : "No disponible"}
                            </td>
                            <td className="px-4 py-2 border-b text-center">
                                {pedido.factura?.[0]?.venta_total
                                    ? `$${parseFloat(pedido.factura[0].venta_total).toLocaleString('es-AR', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}`
                                    : "No disponible"}
                            </td>
                            <td className="px-4 py-2 border-b text-center">
                                {pedido.metodoPago?.[0]?.descripcion || "No disponible"}
                            </td>
                            <td className="px-4 py-2 border-b text-center bg-blue-200">
                                {pedido.pago?.pago_estado || "No disponible"}
                            </td>
                            <td className="px-4 py-2 border-b text-center">
                                {!isAssigned ? (
                                    <button
                                        onClick={() => handleAsignar(pedido.pedido_id)}
                                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-700"
                                    >
                                        Asignar
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleEditar(pedido)}
                                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-700"
                                    >
                                        Editar
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="flex justify-between mt-4">
                <button
                    onClick={() => handlePageChange(setPage, -1, totalPages)}
                    className="px-4 py-2 bg-gray-300 rounded"
                    disabled={currentPage === 1}
                >
                    Anterior
                </button>
                <span>
                    Página {currentPage} de {totalPages}
                </span>
                <button
                    onClick={() => handlePageChange(setPage, 1, totalPages)}
                    className="px-4 py-2 bg-gray-300 rounded"
                    disabled={currentPage === totalPages}
                >
                    Siguiente
                </button>
            </div>
        </div>
    );

    return (
        <div className="p-6 bg-gray-100 min-h-screen ">
            <div className="flex justify-between">
                <h1 className="text-2xl font-bold mb-6">Gestión de Pedidos</h1>
                <Link
                    to="/manage-products"
                    className="inline-flex items-center mb-4 px-4 py-2 bg-[#0D6E6E] text-white rounded-lg shadow-lg hover:bg-[#4a9d9c] transition-all"
                >
                    <AiOutlineArrowLeft className="mr-2 text-xl" />
                    Ir a productos
                </Link>
            </div>
            {renderPedidosTable(
                'Pedidos Asignados',
                paginatedAssignedPedidos,
                true,
                currentPageAssigned,
                setCurrentPageAssigned,
                totalPagesAssigned
            )}
            {renderPedidosTable(
                'Pedidos Sin Asignar',
                paginatedUnassignedPedidos,
                false,
                currentPageUnassigned,
                setCurrentPageUnassigned,
                totalPagesUnassigned
            )}

            <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Consultas sin Respuesta</h2>
                <table className="table-auto w-full border-collapse border border-gray-300">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-gray-300 px-4 py-2">Pregunta</th>
                            <th className="border border-gray-300 px-4 py-2">Fecha</th>
                            <th className="border border-gray-300 px-4 py-2">Código Producto</th>
                            <th className="border border-gray-300 px-4 py-2">CUIL Cliente</th>
                            <th className="border border-gray-300 px-4 py-2">Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {consultasSinRespuesta.length > 0 ? (
                            consultasSinRespuesta.map((consulta, index) => (
                                <tr key={index}>
                                    <td className="border border-gray-300 px-4 py-2">{consulta.consulta_pregunta}</td>
                                    <td className="border border-gray-300 px-4 py-2">{consulta.consulta_fechapreg
                                        ? new Date(consulta.consulta_fechapreg).toLocaleDateString()
                                        : "No disponible"}</td>
                                    <td className="border border-gray-300 px-4 py-2">{consulta.cod_prod}</td>
                                    <td className="border border-gray-300 px-4 py-2">{consulta.cli_cuil}</td>
                                    <td className="border border-gray-300 px-4 py-2 text-center">
                                        <Link
                                            to={`/products/${consulta.cod_prod}`}
                                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-700"
                                        >
                                            Ver
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center py-4">
                                    No hay consultas sin respuesta.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
                    <div className="bg-white p-6 rounded shadow-lg w-96">
                        <h2 className="text-xl mb-4">Editar Estados</h2>
                        <div className="mb-4">
                            <label className="block mb-2">Estado del Pedido</label>
                            <select
                                value={nuevoEstadoPedido}
                                onChange={(e) => setNuevoEstadoPedido(e.target.value)}
                                className="w-full border rounded px-3 py-2"
                            >
                                {estadosPedido.map((estado, index) => (
                                    <option key={index} value={estado}>
                                        {estado}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block mb-2">Estado de Pago</label>
                            <select
                                value={nuevoEstadoPago}
                                onChange={(e) => setNuevoEstadoPago(e.target.value)}
                                className="w-full border rounded px-3 py-2"
                            >
                                {estadosPago.map((estado, index) => (
                                    <option key={index} value={estado}>
                                        {estado}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex justify-between">
                            <button
                                onClick={() => setModalOpen(false)}
                                className="bg-gray-400 text-white px-3 py-1 rounded"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleGuardar}
                                className="bg-blue-500 text-white px-3 py-1 rounded"
                            >
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Operador;
