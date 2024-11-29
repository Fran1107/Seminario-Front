import React, { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

const Ayuda = () => {
    const [activeIndex, setActiveIndex] = useState(null);
    const [motivo, setMotivo] = useState('');
    const [consulta, setConsulta] = useState('');

    const preguntas = [
        {
            pregunta: "Realizar un pedido",
            respuesta: "Solo tenés que seleccionar todos los productos que deseas adquirir y comprar.",
        },
        {
            pregunta: "Precio",
            respuesta: "Los precios pueden variar dependiendo del tipo de producto."
        },
        {
            pregunta: "Formas de pago",
            respuesta: "Aceptamos tarjetas de crédito, débito y otros métodos de pago en línea."
        },
        {
            pregunta: "Depósito - Transferencia bancaria",
            respuesta: "También puedes realizar el pago a través de transferencia bancaria."
        },
        {
            pregunta: "Mercadopago",
            respuesta: "Puedes utilizar Mercadopago como método de pago."
        },
        {
            pregunta: "Envíos",
            respuesta: "Realizamos envíos a todo el país."
        },
        {
            pregunta: "Facturación",
            respuesta: "Se emite una factura para cada compra realizada."
        },
    ];

    const toggleIndex = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (motivo && consulta) {
            const subject = encodeURIComponent(`Consulta: ${motivo}`);
            const body = encodeURIComponent(`Motivo: ${motivo}\n\nConsulta: ${consulta}`);
            window.location.href = `mailto:ejemplo@ejemplo.com?subject=${subject}&body=${body}`;
        } else {
            alert('Por favor, completa todos los campos.');
        }
    };

    return (
        <div className="max-w-md mx-auto p-4">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Preguntas Frecuentes</h2>
            {preguntas.map((item, index) => (
                <div key={index} className="border-b border-gray-300 py-2">
                    <div
                        onClick={() => toggleIndex(index)}
                        className="flex justify-between items-center cursor-pointer text-lg font-medium text-gray-700 hover:text-[#0D6E6E]"
                    >
                        <span>{item.pregunta}</span>
                        <span className="text-[#0D6E6E]">
                            {activeIndex === index ? <FiChevronUp /> : <FiChevronDown />}
                        </span>
                    </div>
                    {activeIndex === index && (
                        <div className="mt-2 text-gray-600">
                            {item.respuesta}
                        </div>
                    )}
                </div>
            ))}

            <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-4">Envíanos tu consulta</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="motivo" className="block text-sm font-medium text-gray-700">Motivo</label>
                    <select
                        id="motivo"
                        className="w-full p-2 border rounded-md focus:ring-[#0D1F2D] focus:border-[#0D6E6E]"
                        value={motivo}
                        onChange={(e) => setMotivo(e.target.value)}
                        required
                    >
                        <option value="">Selecciona un motivo</option>
                        <option value="Consulta general">Consulta general</option>
                        <option value="Consulta de un producto">Consulta de un producto</option>
                        <option value="Consulta sobre mi pedido">Consulta sobre mi pedido</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="consulta" className="block text-sm font-medium text-gray-700">Consulta</label>
                    <textarea
                        id="consulta"
                        rows="4"
                        className="w-full p-2 border rounded-md focus:ring-[#0D6E6E] focus:border-[#4a9d9c]"
                        placeholder="Escribe tu consulta aquí"
                        value={consulta}
                        onChange={(e) => setConsulta(e.target.value)}
                        required
                    ></textarea>
                </div>
                <button
                    type="submit"
                    className="w-full bg-[#0D6E6E] text-white py-2 px-4 rounded-lg hover:bg-[#4a9d9c] transition-all"
                >
                    Enviar consulta
                </button>
            </form>
        </div>
    );
};

export default Ayuda;
