import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import { AiOutlineArrowLeft } from 'react-icons/ai';
import { Link } from 'react-router-dom';

const Ventas = () => {
    const [ventas, setVentas] = useState([]);
    const [ventasFiltradas, setVentasFiltradas] = useState([]);
    const [filter, setFilter] = useState('mes'); 
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); 
    const [productosVendidos, setProductosVendidos] = useState({ labels: [], data: [] });

    useEffect(() => {
        const fetchVentas = async () => {
            try {
                const response = await fetch('http://localhost:3000/ventas');
                const ventasData = await response.json();
                setVentas(ventasData);
            } catch (error) {
                console.error('Error al obtener las ventas:', error);
            }
        };
        fetchVentas();
    }, []);

    useEffect(() => {
        const now = new Date();
        let filteredVentas = [];
        let dates = []; 

        switch (filter) {
            case 'mes':
                // Filtrar desde el primer día del mes hasta el ultimo dia del mes
                const primerDiaMes = new Date(now.getFullYear(), selectedMonth, 1);
                const ultimoDiaMes = new Date(now.getFullYear(), selectedMonth + 1, 0); 
                filteredVentas = ventas.filter((venta) => {
                    const fechaVenta = new Date(venta.venta_fecha);
                    return fechaVenta >= primerDiaMes && fechaVenta <= ultimoDiaMes;
                });

                // Generar los dias del mes seleccionado
                const daysInMonth = new Date(now.getFullYear(), selectedMonth + 1, 0).getDate();
                dates = Array.from({ length: daysInMonth }, (_, i) => {
                    const date = new Date(now.getFullYear(), selectedMonth, i + 1);
                    return date.toLocaleDateString('es-ES');
                });
                break;

            case 'año':
                // Filtrar todas las ventas del año actual
                filteredVentas = ventas.filter((venta) => {
                    const fechaVenta = new Date(venta.venta_fecha);
                    return fechaVenta.getFullYear() === now.getFullYear();
                });

                // Generar todos los meses del año
                dates = Array.from({ length: 12 }, (_, i) => {
                    const date = new Date(now.getFullYear(), i, 1);
                    return `${date.getMonth() + 1}/${date.getFullYear()}`;
                });
                break;

            default:
                break;
        }

        // Agrupar las ventas filtradas por fecha, mes o año
        const groupedData = groupVentasByDate(filteredVentas, dates);
        setVentasFiltradas(groupedData);
    }, [ventas, filter, selectedMonth]);

    const groupVentasByDate = (ventas, dates) => {
        const grouped = {};

        // Inicializar los valores para todas las fechas
        dates.forEach((date) => {
            grouped[date] = 0;
        });

        ventas.forEach((venta) => {
            const fecha = new Date(venta.venta_fecha);
            let label;

            // Si estamos filtrando por 'año', agrupamos por mes
            if (filter === 'año') {
                label = `${fecha.getMonth() + 1}/${fecha.getFullYear()}`; 
            } else if (filter === 'mes') {
                label = `${fecha.getDate()}/${fecha.getMonth() + 1}/${fecha.getFullYear()}`; 
            }

            if (grouped[label] !== undefined) {
                grouped[label] += 1; 
            }
        });

        const labels = Object.keys(grouped);
        const data = Object.values(grouped);
        return { labels, data };
    };

    const datosGrafico = {
        labels: ventasFiltradas.labels,
        datasets: [
            {
                label: 'Cantidad de Ventas',
                data: ventasFiltradas.data,
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            },
        ],
    };

    useEffect(() => {
        // Obtener detalles de cada venta y contar productos vendidos
        const fetchProductosVendidos = async () => {
            try {
                const productCount = {};

                // Iterar por cada venta y obtener sus productos
                for (const venta of ventas) {
                    const detResponse = await fetch(`http://localhost:3000/ventas/detVenta/${venta.nro_factura}`);
                    const detalles = await detResponse.json();

                    // Contar cada producto vendido
                    detalles.forEach((detalle) => {
                        if (productCount[detalle.cod_prod]) {
                            productCount[detalle.cod_prod] += 1;
                        } else {
                            productCount[detalle.cod_prod] = 1;
                        }
                    });
                }
                const productEntries = [];

                for (const codProd in productCount) {
                    const prodResponse = await fetch(`http://localhost:3000/products/${codProd}`);
                    const product = await prodResponse.json();
                    productEntries.push({ nombre: product.prod_nombre, cantidad: productCount[codProd] });
                }

                // Ordenar productos por cantidad de ventas en orden descendente
                productEntries.sort((a, b) => b.cantidad - a.cantidad);

                // Limitar a los 15 productos más vendidos
                const topProducts = productEntries.slice(0, 15);
                const otros = productEntries.slice(15);

                // Sumar las ventas de los productos restantes como "Otros"
                const otrosCantidad = otros.reduce((total, prod) => total + prod.cantidad, 0);
                if (otrosCantidad > 0) {
                    topProducts.push({ nombre: 'Otros', cantidad: otrosCantidad });
                }

                // Preparar los datos para el gráfico
                setProductosVendidos({
                    labels: topProducts.map((prod) => prod.nombre),
                    data: topProducts.map((prod) => prod.cantidad),
                });
            } catch (error) {
                console.error('Error al obtener los productos vendidos:', error);
            }
        };

        if (ventas.length > 0) {
            fetchProductosVendidos();
        }
    }, [ventas]);

    // Configuración del gráfico de torta
    const datosGraficoTorta = {
        labels: productosVendidos.labels,
        datasets: [
            {
                data: productosVendidos.data,
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF',
                    '#FF9F40',
                    '#FF5733',
                    '#33FFCE',
                    '#FFC300',
                    '#C70039',
                    '#581845',
                    '#DAF7A6',
                    '#900C3F',
                    '#FF8C42',
                    '#8C44FF',
                    '#BDC3C7' // Para "Otros"
                ],
            },
        ],
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <main className="flex-1 p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-4 sm:mb-4">Dashboard</h2>
                <Link to="/admin" className="inline-flex items-center px-4 py-2 bg-[#0D6E6E] text-white rounded-lg shadow-lg hover:bg-[#4a9d9c] transition-all transform mb-4">
                    <AiOutlineArrowLeft className="mr-2 text-xl" />
                    Volver al Panel Principal
                </Link>

                <section className="p-4 sm:p-6 bg-white shadow rounded-lg mb-4 sm:mb-6">
                    <h3 className="text-md sm:text-lg font-semibold text-gray-700 mb-3">Estadísticas de Ventas</h3>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4">
                        <label htmlFor="filter" className="mr-2 text-gray-700">Filtrar por:</label>
                        <select
                            id="filter"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="px-2 py-1 border rounded text-sm sm:text-base"
                        >
                            <option value="mes">Este mes</option>
                            <option value="año">Este año</option>
                        </select>
                        {filter === 'mes' && (
                            <div className="mt-2 sm:mt-0 sm:ml-4">
                                <label htmlFor="month" className="mr-2 text-gray-700">Seleccionar mes:</label>
                                <select
                                    id="month"
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                    className="px-2 py-1 border rounded text-sm sm:text-base"
                                >
                                    {Array.from({ length: 12 }, (_, i) => (
                                        <option key={i} value={i}>
                                            {new Date(0, i).toLocaleString('es-ES', { month: 'long' })}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Gráfico de barras responsive */}
                    <div className="h-64 sm:h-72 lg:h-80">
                        <Bar
                            data={datosGrafico}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                aspectRatio: 2, 
                            }}
                        />
                    </div>

                    <h3 className="text-md sm:text-lg font-semibold text-gray-700 mb-3 mt-8">Productos Más Vendidos</h3>

                    {/* Gráfico de torta responsive */}
                    <div className="h-64 sm:h-72 lg:h-80">
                        <Pie
                            data={datosGraficoTorta}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                aspectRatio: 1, 
                            }}
                        />
                    </div>
                </section>
            </main>
        </div>

    );
};

export default Ventas;
