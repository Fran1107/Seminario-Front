import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { AuthService } from '../../Cookies/AuthService'
import { Link, useNavigate } from 'react-router-dom'
import { FcGoogle } from 'react-icons/fc'

const Login = () => {
    const { register, handleSubmit } = useForm()
    const navigate = useNavigate()
    const [error, setError] = useState()
    const logueado = AuthService.getUser()

    // Redirige a "/" si el usuario está logueado
    useEffect(() => {
        if (logueado) {
            navigate('/');
        }
    }, [logueado, navigate]);

    const enviar = async (data) => {
        const res = await fetch("http://localhost:3000/user/login", {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
            credentials: 'include', 
        })

        const result = await res.json()

        if (result.status === 'success') {
            AuthService.login(result.user, result.token)
            // Redirige segun el rol del usuario
            if (result.user.rol === 'Admin') {
                navigate('/admin');
            } else if (result.user.rol === 'Operador') {
                navigate('/operador'); 
            }else {
                navigate('/'); 
            } 

            window.location.reload();
        } else {
            setError(result.message) 
        }
    }

    const googleLogin = () => {
        window.open("http://localhost:3000/user/google", "_self");
    }

    return (
        <section className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className='bg-white w-full max-w-md p-10 rounded-md shadow-xl'>
                <h1 className='text-3xl text-center text-gray-700 font-semibold mb-6'>Iniciar sesión</h1>
                {error && <h1 className='mt-4 text-red-500 text-center'>{error}</h1>}
                <form onSubmit={handleSubmit(enviar)} className="space-y-4">
                    <input
                        className='w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C78753]'
                        type='email'
                        name='cli_email'
                        placeholder='Correo electrónico'
                        {...register("email", { required: true })}
                    />
                    <input
                        className='w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C78753]'
                        type='password'
                        name='cli_contrasena'
                        placeholder='Contraseña'
                        {...register("contrasena", { required: true })} 
                    />
                    <button className='w-full bg-gradient-to-r from-[#0D6E6E] to-[#4a9d9c] text-white py-2 rounded-md hover:shadow-lg transition duration-300 font-semibold' type='submit'>
                        Iniciar sesión
                    </button>
                </form>

                <div className='mt-6 flex items-center'>
                    <div className='flex-grow h-px bg-gray-300'></div>
                    <span className='text-gray-400 px-4'>O</span>
                    <div className='flex-grow h-px bg-gray-300'></div>
                </div>

                <button onClick={googleLogin} className="mt-6 flex items-center justify-center w-full bg-white border border-gray-300 text-gray-700 py-2 rounded-md shadow-md hover:bg-gray-100 transition duration-300">
                    <FcGoogle className='text-2xl mr-3' />
                    <span className='font-semibold'>Continuar con Google</span>
                </button>
                <div className="mt-4 text-center">
                    <p className='text-gray-500'>¿No tienes cuenta?</p>
                    <Link to='/register' className='mt-2 text-[#0D6E6E] hover:underline transition duration-300 font-bold'>
                        Regístrate
                    </Link>
                </div>
            </div>
        </section>
    )
}

export default Login
