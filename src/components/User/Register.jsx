import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { AuthService } from '../../Cookies/AuthService'
import { useNavigate } from 'react-router-dom'
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai'

const Register = () => {
    const { register, handleSubmit } = useForm()
    const navigate = useNavigate()

    const [error, setError] = useState()
    const [showPopup, setShowPopup] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [provincias, setProvincias] = useState([])
    const [localidades, setLocalidades] = useState([])
    const [selectedProvincia, setSelectedProvincia] = useState('')

    useEffect(() => {
        const fetchProvincias = async () => {
            const res = await fetch("http://localhost:3000/provincias")
            const data = await res.json()
            setProvincias(data) 
        }
        fetchProvincias()
    }, [])

    const handleProvinciaChange = async (event) => {
        const provinciaId = event.target.value
        setSelectedProvincia(provinciaId)

        const res = await fetch(`http://localhost:3000/localidades/${provinciaId}`)
        const data = await res.json()
        setLocalidades(data) 
    }

    const enviar = async (data) => {
        console.log(data)
        const res = await fetch("http://localhost:3000/user/register", {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json" }
        })
        console.log('2', res)

        const result = await res.json()
        console.log('3',result)
        if (result.status === 'success') {
            AuthService.setToken(result.token)
            setShowPopup(true)
        } else {
            setError(result.message)
        }
    }

    const handleLoginRedirect = () => {
        setShowPopup(false)
        navigate('/login')
    }

    return (
        <section className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className='bg-white w-full max-w-lg p-10 rounded-md shadow-lg'>
                <h1 className='text-3xl text-center text-gray-700 font-semibold mb-6'>Crear Cuenta</h1>
                {error && <h1 className='mt-4 text-red-500 text-center'>{error}</h1>}
                
                <form onSubmit={handleSubmit(enviar)} className='space-y-4'>
                    <div className='flex flex-col md:flex-row md:space-x-4'>
                        <input className='w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C78753] mb-4 md:mb-0' type="text" name='cli_nombre' placeholder='Nombre' required {...register("cli_nombre", { required: true })} />
                        <input className='w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C78753]' type="text" name='cli_apellido' placeholder='Apellido' required {...register("cli_apellido", { required: true })} />
                    </div>

                    <div className='flex flex-col md:flex-row md:space-x-4'>
                        <input className='w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C78753] mb-4 md:mb-0' type="string" name='cli_cuil' placeholder='CUIL' required {...register("cli_cuil", { required: true })} />
                        <input className='w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C78753]' type="string" name='cli_dni' placeholder='DNI' required {...register("cli_dni", { required: true })} />
                    </div>

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

                    <input className='w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C78753]' type="email" name='cli_email' placeholder='Email' required {...register("cli_email", { required: true })} />
                    <input className='w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C78753]' type="text" name='cli_telefono' placeholder='Telefono' required {...register("cli_telefono", { required: true })} />
                    
                    <div className='flex flex-col md:flex-row md:space-x-4'>
                        <div className='relative w-full mb-4 md:mb-0'>
                            <input className='w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C78753]' type={showPassword ? 'text' : 'password'} name='cli_contrasena' placeholder='Contraseña' required {...register("cli_contrasena", { required: true })} />
                            <div className="absolute inset-y-0 right-3 flex items-center cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <AiFillEye className="text-gray-500" /> : <AiFillEyeInvisible className="text-gray-500" />}
                            </div>
                        </div>
                        <div className="relative w-full">
                            <input className='w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C78753]' type={showConfirmPassword ? 'text' : 'password'} name='confirmarContrasena' placeholder='Confirmar Contraseña' required />
                            <div className="absolute inset-y-0 right-3 flex items-center cursor-pointer" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                {showConfirmPassword ? <AiFillEye className="text-gray-500" /> : <AiFillEyeInvisible className="text-gray-500" />}
                            </div>
                        </div>
                    </div>
                    
                    <button className='w-full bg-gradient-to-r from-[#0D6E6E] to-[#4a9d9c] text-white py-2 rounded-md hover:shadow-lg transition duration-300 font-semibold' type='submit'>Registrarse</button>
                </form>

                {showPopup && (
                    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center">
                        <div className="bg-white p-8 rounded-md shadow-md text-center">
                            <h2 className="text-xl font-bold mb-4">¡Registro exitoso!</h2>
                            <p className="mb-4">Ahora puedes iniciar sesión</p>
                            <button 
                                className="bg-gradient-to-r from-[#0D6E6E] to-[#4a9d9c] text-white px-4 py-2 rounded-md hover:shadow-lg"
                                onClick={handleLoginRedirect}>Iniciar sesión
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}

export default Register
