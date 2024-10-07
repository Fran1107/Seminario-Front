import React, { useEffect, useState } from 'react'
import {useForm} from 'react-hook-form'
import { AuthService } from '../Cookies/AuthService'
import { useNavigate } from 'react-router-dom'


const Register = () => {

    const {register, handleSubmit} = useForm()
    const navigate = useNavigate()

    const enviar = async (data) => {
        console.log(data)
        const res = await fetch("http://localhost:1822/user/register", {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {"Content-Type": "application/json"}
        })
        console.log(res)
        const result = await res.json()
        console.log(result)

        if(result.status === 'success'){
            AuthService.setToken(result.token) //Guarda el token en las cookies
            navigate('/') // Redirigir a la principal despues del register
        }else{
            error('Error al registrarse')
        }
    }

return (
    <div className='bg-zinc-800 max-w-md  p-10 rounded-md m-auto'>
        <h1 className='text-white'>Registrarse</h1>
        <form onSubmit={handleSubmit(enviar)}>
            <input className='w-full bg-zinc-700 text-white px-4 py-2 m-2 rounded-md' type="text" name='nombre' placeholder='Nombre' {...register("nombre", {required:true})} />
            <input className='w-full bg-zinc-700 text-white px-4 py-2 m-2 rounded-md' type="text" name='apellido' placeholder='Apellido' {...register("apellido", {required:true})} />
            <input className='w-full bg-zinc-700 text-white px-4 py-2 m-2 rounded-md' type="email" name='email' placeholder='Email' {...register("email", {required:true})} />
            <input className='w-full bg-zinc-700 text-white px-4 py-2 m-2 rounded-md' type="password" name='contrasena' placeholder='Contraseña' {...register("contrasena", {required:true})} />
        
            <button className='text-white' type='submit'>Enviar</button>
        </form>
    </div>
)
}

export default Register
