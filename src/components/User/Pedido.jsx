import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { AuthService } from '../../Cookies/AuthService';

const Pedido = () => {
    const { id } = useParams();
    const [pedido, setPedido] = useState({});
    const [fac, setFac] = useState({});
    const [detVenta, setDetVenta] = useState([]);
    const [products, setProducts] = useState([]);
    const [envio, setEnvio] = useState([]);
    const [domic, setDomic] = useState({});
    const [pago, setPago] = useState({});
    const [metpago, setMetPago] = useState({});
    const [user, setUser] = useState(null);
    const [facturas, setFacturas] = useState([]);

    const fetchData = useCallback(async () => {
        try {
            const responsePedido = await fetch(`http://localhost:3000/pedido/getPedido/${id}`);
            if (responsePedido.ok) {
                const resPedido = await responsePedido.json();
                setPedido(Array.isArray(resPedido) ? resPedido[0] : resPedido);
            }

            if (pedido.nro_factura) {
                const [facResponse, detVentaResponse, envioResponse, pagoResponse] = await Promise.all([
                    fetch(`http://localhost:3000/ventas/getFac/${pedido.nro_factura}`),
                    fetch(`http://localhost:3000/ventas/detVenta/${pedido.nro_factura}`),
                    fetch(`http://localhost:3000/envios/${pedido.nro_factura}`),
                    fetch(`http://localhost:3000/pago/getPago/${pedido.nro_factura}`)
                ]);

                if (facResponse.ok) {
                    const facData = await facResponse.json();
                    console.log('fac', facData)
                    setFac(Array.isArray(facData) ? facData[0] : facData);
                }

                if (detVentaResponse.ok) {
                    const detVentaData = await detVentaResponse.json();
                    setDetVenta(detVentaData);
                }

                if (envioResponse.ok) {
                    const envioData = await envioResponse.json();
                    setEnvio(Array.isArray(envioData) ? envioData[0] : envioData);
                    if (envioData[0]?.domic_id) {
                        const domicilioResponse = await fetch(`http://localhost:3000/domicilio/getDom/${envioData[0].domic_id}`);
                        if (domicilioResponse.ok) {
                            const domicilioData = await domicilioResponse.json();
                            setDomic(Array.isArray(domicilioData) ? domicilioData[0] : domicilioData);
                        }
                    }
                }
                if (pagoResponse.ok) {
                    const pagoData = await pagoResponse.json();
                    setPago(Array.isArray(pagoData) ? pagoData[0] : pagoData);
                }
            }
        } catch (error) {
            console.error('Error al obtener los datos:', error);
        }
    }, [id, pedido.nro_factura]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                const productsData = await Promise.all(
                    detVenta.map(async (item) => {
                        const [responseProd, responseImage] = await Promise.all([
                            fetch(`http://localhost:3000/products/${item.cod_prod}`),
                            fetch(`http://localhost:3000/imgproduct/getImagesByProductId/${item.cod_prod}`)
                        ]);

                        if (responseProd.ok) {
                            const productData = await responseProd.json();
                            let productImage = null;
                            if (responseImage.ok) {
                                const imageData = await responseImage.json();
                                productImage = imageData[0]?.img_url || null;
                            }
                            return { ...productData, image: productImage, cantidad: item.detventa_cantidad, subtotal: item.detventa_subtotal };
                        }
                        return null;
                    })
                );
                setProducts(productsData.filter((prod) => prod !== null));
            } catch (error) {
                console.error('Error al obtener productos:', error);
            }
        };
        if (detVenta.length > 0) fetchProductDetails();
    }, [detVenta]);

    useEffect(() => {
        if (pago.metpago_id) {
            const fetchPago = async () => {
                try {
                    const responsePago = await fetch(`http://localhost:3000/metpago/${pago.metpago_id}`)
                    if (responsePago.ok) {
                        const res = await responsePago.json()
                        setMetPago(Array.isArray(res) ? res[0] : res)
                    } else {
                        console.error('error al obtener el metodo de pago')
                    }
                } catch (error) {
                    console.error('Error de conexión:', error)
                }
            }
            fetchPago()
        }
    }, [pago.metpago_id])

    useEffect(() => {
        const loggedUser = AuthService.getUser();
        setUser(loggedUser);
        const fetchFactura = async () => {
            try {
                const responseFactura = await fetch(`http://localhost:3000/ventas/${loggedUser.cli_cuil}`);
                if (responseFactura.ok) {
                    const facturasData = await responseFactura.json();
                    setFacturas(Array.isArray(facturasData) ? facturasData[0] : facturasData);
                } else {
                    console.error('error al obtener la factura')
                }
            } catch (error) {
                console.error('Error de conexión:', error)
            }
        }
        fetchFactura()
    }, [])


    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Pedido nro: {pedido.pedido_id}</h1>
            <h1 className="text-xl font-bold text-gray-800 mb-4">Estado: {pedido.estado}</h1>

            <div className="border-b border-gray-200 pb-4 mb-6">
            <p className="text-gray-600">
                    <span className="font-semibold">Nro Factura:</span> {fac.nro_factura }
                </p>
                <p className="text-gray-600">
                    <span className="font-semibold">Fecha:</span> {fac.venta_fecha ? new Date(fac.venta_fecha).toLocaleDateString() : 'Cargando...'}
                </p>
                <p className="text-gray-600">
                    <span className="font-semibold">Monto Total:</span> ${parseFloat(fac.venta_total).toLocaleString('es-AR', {
                    minimumFractionDigits: 0,
                })}
                </p>
            </div>

            <h2 className="text-xl font-semibold text-gray-800 mb-4">Productos comprados</h2>
            <ul className="space-y-4">
                {products.map((product, index) => (
                    <li key={index} className="flex items-start p-4 bg-gray-50 rounded-lg border border-gray-200">
                        {product.url_imagen && (
                            <img src={product.url_imagen} alt={product.prod_nombre} className="w-24 h-24 object-cover rounded mr-4" />
                        )}
                        <div>
                            <p className="text-lg font-semibold text-gray-800">{product.prod_nombre}</p>
                            <p className="text-gray-600">
                                <span className="font-semibold">Cantidad:</span> {product.cantidad}
                            </p>
                            <p className="text-gray-600">
                                <span className="font-semibold">Subtotal:</span> ${parseFloat(product.subtotal).toLocaleString('es-AR', {
                    minimumFractionDigits: 0,
                })}
                            </p>
                        </div>
                    </li>
                ))}
            </ul>

            <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Información de Envío</h2>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-600">
                        <span className="font-semibold">Calle:</span> {domic.calle} {domic.numero}
                    </p>
                    <p className="text-gray-600">
                        <span className="font-semibold">Costo: $</span>{parseFloat(envio.costo).toLocaleString('es-AR', {
                    minimumFractionDigits: 0,
                })}
                    </p>
                </div>
            </div>

            <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Pago</h2>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-600">
                        <span className="font-semibold"></span> {metpago.descripcion}
                    </p>
                    <p className="text-green-600">
                        <span className="font-bold"></span> {pago.pago_estado}
                    </p>
                </div>
            </div>

            <div className="mt-8">

                
            </div>
        </div>

    );
};

export default Pedido;
