import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { AuthService } from '../../Cookies/AuthService';
import { useNavigate } from 'react-router-dom';

const EditarPerfil = () => {
    const { register, handleSubmit, setValue } = useForm();
    const navigate = useNavigate();
    const [error, setError] = useState();
    const [success, setSuccess] = useState(false);
    const [provincias, setProvincias] = useState([]);
    const [localidades, setLocalidades] = useState([]);
    const [selectedProvincia, setSelectedProvincia] = useState('');


    useEffect(() => {
        const fetchProvincias = async () => {
            const res = await fetch("http://localhost:3000/provincias");
            const data = await res.json();
            setProvincias(data);
        };
        fetchProvincias();
    }, [])

    const handleProvinciaChange = async (event) => {
        const provinciaId = event.target.value;
        setSelectedProvincia(provinciaId);
        const res = await fetch(`http://localhost:3000/localidades/${provinciaId}`);
        const data = await res.json();
        setLocalidades(data);
    }

    useEffect(() => {
        const user = AuthService.getUser();

        if (user) {
            setValue('cli_nombre', user.nombre || '');
            setValue('cli_apellido', user.cli_apellido || '');
            setValue('cli_telefono', user.cli_telefono || '');
            setValue('cli_cuil', user.cli_cuil >= 10000000 ? user.cli_cuil : '');  
            setValue('cli_dni', user.cli_dni || '');
            setValue('prov_id', user.prov_id || '');
            setValue('local_codpostal', user.local_codpostal || '');
        }
    }, [setValue])

    const enviar = async (data) => {
        const user = AuthService.getUser();

        const res = await fetch("http://localhost:3000/user/update", {
            method: 'PATCH',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                cli_cuil: data.cli_cuil,
                cli_dni: data.cli_dni,
                cli_apellido: data.cli_apellido,
                cli_telefono: data.cli_telefono,
                prov_id: data.prov_id,
                local_codpostal: data.local_codpostal,
                nombre: data.cli_nombre,
                email: user.email,
            }),
            credentials: 'include'
        })


        const result = await res.json();

        if (res.status === 401) {
            setError("No estás autorizado para realizar esta acción. Inicia sesión nuevamente.");
        } else if (result.status === 'success') {
            setSuccess(true);  
            AuthService.login(result.user)

            setTimeout(() => {
                navigate('/profile')
            }, 3000);  // redirige despues de 3 segundos
        } else {
            setError(result.message);
        }
    }

    return (
        <section className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className='bg-white w-full max-w-lg p-10 rounded-md shadow-lg'>
                <h1 className='text-3xl text-center text-gray-700 font-semibold mb-6'>Editar Perfil</h1>
                {error && <h1 className='mt-4 text-red-500 text-center'>{error}</h1>}

                <form onSubmit={handleSubmit(enviar)} className='space-y-4'>
                    <input
                        className='w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C78753]'
                        type="text"
                        placeholder='Nombre'
                        {...register("cli_nombre")}
                    />
                    <input
                        className='w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C78753]'
                        type="text"
                        placeholder='Apellido'
                        {...register("cli_apellido")}
                    />
                    <input
                        className='w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C78753] mb-4 md:mb-0'
                        type="text"
                        placeholder='CUIL'
                        required
                        {...register("cli_cuil")}
                    />
                    <input
                        className='w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C78753]'
                        type="text"
                        placeholder='DNI'
                        required
                        {...register("cli_dni")}
                    />
                    <input
                        className='w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C78753]'
                        type="tel"
                        placeholder='Teléfono'
                        {...register("cli_telefono")}
                    />
                    <div className='flex flex-col md:flex-row md:space-x-4'>
                        <select
                            className='w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C78753] mb-4 md:mb-0'
                            {...register("prov_id", { required: true })}
                            onChange={handleProvinciaChange}>
                            <option value="">Provincia</option>
                            {provincias.map(provincia => (
                                <option key={provincia.prov_id} value={provincia.prov_id}>
                                    {provincia.prov_nombre}
                                </option>
                            ))}
                        </select>

                        <select
                            className='w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C78753]'
                            {...register("local_codpostal", { required: true })}>
                            <option value="">Localidad</option>
                            {localidades.map(loc => (
                                <option key={loc.local_codpostal} value={loc.local_codpostal}>
                                    {loc.local_nombre}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button className='w-full bg-gradient-to-r from-[#E5B17B] to-[#C78753] text-white py-2 rounded-md hover:shadow-lg transition duration-300 font-semibold' type='submit'>
                        Guardar cambios
                    </button>
                    {/* Botón de Volver */}
                    <button
                        onClick={() => navigate('/profile')}
                        className='w-full bg-gradient-to-r from-[#E5B17B] to-[#C78753] text-white py-2 rounded-md hover:shadow-lg transition duration-300 font-semibold'>
                        Volver sin guardar
                    </button>
                </form>
            </div>

            {/* popup */}
            {success && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h2 className="text-xl font-semibold text-center">Perfil actualizado correctamente.</h2>
                        <p className="text-center text-gray-600">Redirigiendo a tu perfil...</p>
                    </div>
                </div>
            )}
        </section>
    );
};

export default EditarPerfil;
