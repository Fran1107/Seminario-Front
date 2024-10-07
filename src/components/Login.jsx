import React from 'react'
import { useForm } from 'react-hook-form'
import { AuthService } from '../Cookies/AuthService'
import { useNavigate } from 'react-router-dom'

const Login = () => {

    const {register, handleSubmit} = useForm()
    const navigate = useNavigate()

    const enviar = async (data) => {
        const res = await fetch("http://localhost:1822/user/login",{
            method: 'POST',
            body: JSON.stringify(data),
            headers: {"Content-Type": "application/json"}
        })
        const result = await res.json()

        if(result.status === 'success'){
            AuthService.login(result.user ,result.token) //Guarda el token en las cookies y el usuario con rol

            if (result.user.rol == 'administrador'){
                navigate('/admin') //Redirigir a admin
            }else{
                navigate('/') // Redirigir a la pagina principal despues del login
            }

            // Redirigir o recargar la página para actualizar la Navbar
            window.location.reload();
        }else {
            console.log(result.error)
        }
    }
return (
    <div className='bg-zinc-800 max-w-md  p-10 rounded-md m-auto'>
        <h1 className='text-white'>Login</h1>
        <form onSubmit={handleSubmit(enviar)}>
            <input className='w-full bg-zinc-700 text-white px-4 py-2 m-2 rounded-md' type='text' name='email' placeholder='Email' {...register("email",{required:true})} />
            <input className='w-full bg-zinc-700 text-white px-4 py-2 m-2 rounded-md' type='password' name='contrasena' placeholder='Contraseña' {...register("contrasena",{required:true})} />
        
            <button className='text-white' type='submit'>Enviar</button>
        </form>
    </div>
)
}

export default Login
