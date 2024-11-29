import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AiOutlineArrowLeft } from 'react-icons/ai';
import { FaUser, FaUserTie } from 'react-icons/fa';

const Users = () => {
    const [operators, setOperators] = useState([])
    const [clients, setClients] = useState([])
    const [viewType, setViewType] = useState("all")
    const [searchTerm, setSearchTerm] = useState("")

    const loadUsers = async () => {
        const response = await fetch("http://localhost:3000/user", {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json()
        setClients(data)
    };

    const loadOpers = async () => {
        const response = await fetch("http://localhost:3000/admin", {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        const data1 = await response.json();
        setOperators(data1);
    };

    useEffect(() => {
        loadUsers()
        loadOpers()
    }, [])

    // Filtros de users
    const filterUsers = (users) => {
        return users.filter(user => {
            const fullName = `${user.oper_nombre || user.nombre} ${user.oper_apellido || user.cli_apellido}`.toLowerCase();
            return (
                fullName.includes(searchTerm.toLowerCase()) ||
                (user.cli_dni && user.cli_dni.includes(searchTerm)) || 
                (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) 
            );
        })
    }

    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-semibold text-gray-800">Gestión de Usuarios</h1>
                <Link to="/admin" className="flex items-center px-4 py-2 bg-[#0D6E6E] text-white font-medium rounded-lg shadow-lg hover:bg-blue-700 transition-all transform hover:-translate-y-1 active:translate-y-1">
                    <AiOutlineArrowLeft className="mr-2 text-xl" />
                    Volver al Panel Principal
                </Link>
            </div>
            {/* Campo de busqueda */}
            <div className="mb-6">
                <input type="text" placeholder="Buscar por nombre, DNI o email..." className="w-full px-4 py-2 border rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
            </div>

            {/* Botones de filtro */}
            <div className="flex space-x-4 mb-8">
                <button onClick={() => setViewType("all")} className={`px-4 py-2 rounded-lg shadow-md font-medium transition-all transform hover:scale-105 active:scale-95 ${
                        viewType === "all" ? "bg-[#0D6E6E] text-white" : "bg-gray-200 text-gray-600"
                    }`}>Todos
                </button>
                <button onClick={() => setViewType("operators")} className={`px-4 py-2 rounded-lg shadow-md font-medium transition-all transform hover:scale-105 active:scale-95 ${
                        viewType === "operators" ? "bg-[#0D6E6E] text-white" : "bg-gray-200 text-gray-600"
                    }`}>Operadores
                </button>
                <button onClick={() => setViewType("clients")} className={`px-4 py-2 rounded-lg shadow-md font-medium transition-all transform hover:scale-105 active:scale-95 ${
                        viewType === "clients" ? "bg-[#0D6E6E] text-white" : "bg-gray-200 text-gray-600"
                    }`}>Clientes
                </button>
            </div>

            {/* Contenedor de usuarios */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Filtrar y mostrar operadores si se selecciona "all" o "operators" */}
                {(viewType === "all" || viewType === "operators") && (
                    <div className="bg-white shadow-lg rounded-lg p-6">
                        <h2 className="text-2xl font-semibold text-gray-700 mb-6 flex items-center">
                            <FaUserTie className="mr-2 text-[#0D6E6E]" /> Operadores
                        </h2>
                        <div className="space-y-4">
                            {filterUsers(operators).map((operador) => (
                                <div key={operador.oper_cuil} className="border-b border-gray-200 pb-4 flex flex-col space-y-1">
                                    <p><span className="font-medium text-gray-800">Nombre:</span> {operador.oper_nombre} {operador.oper_apellido}</p>
                                    <p><span className="font-medium text-gray-800">Teléfono:</span> {operador.oper_telefono}</p>
                                    <p><span className="font-medium text-gray-800">Email:</span> {operador.email}</p>
                                    <p><span className="font-medium text-gray-800">Rol:</span> {operador.rol}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Filtrar y mostrar clientes si se selecciona "all" o "clients" */}
                {(viewType === "all" || viewType === "clients") && (
                    <div className="bg-white shadow-lg rounded-lg p-6">
                        <h2 className="text-2xl font-semibold text-gray-700 mb-6 flex items-center">
                            <FaUser className="mr-2 text-[#0D6E6E]" /> Clientes
                        </h2>
                        <div className="space-y-4">
                            {filterUsers(clients).map((cliente) => (
                                <div key={cliente.cli_cuil} className="border-b border-gray-200 pb-4 flex flex-col space-y-1">
                                    <p><span className="font-medium text-gray-800">DNI:</span> {cliente.cli_dni}</p>
                                    <p><span className="font-medium text-gray-800">Nombre:</span> {cliente.nombre} {cliente.cli_apellido}</p>
                                    <p><span className="font-medium text-gray-800">Email:</span> {cliente.email}</p>
                                    <p><span className="font-medium text-gray-800">Rol:</span> {cliente.rol}</p>
                                    <p><span className="font-medium text-gray-800">Provincia:</span> {cliente.provincia}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Users;
